// controllers/tranzilaController.js
import { OrderService } from '../services/orderService.js';
import { TranzilaService } from '../services/tranzilaService.js';
import { CustomError } from '../utils/CustomError.js';
import { sendOrderCreatedEmails } from "../utils/email/orderEmails.js";

export class TranzilaController {
  static async startIframe(req, res, next) {
    try {
      const payload = req.validated ?? req.body ?? {};
      const { orderId, items } = payload.body || payload;

      if (!Array.isArray(items) || items.length === 0) {
        throw new CustomError('No items selected', 400);
      }

      const terminal = process.env.TRANZILA_TERMINAL;
      const baseUrl = process.env.BASE_URL;

      if (!terminal || !baseUrl) {
        throw new CustomError('Payment configuration missing', 500);
      }

      const orderService = new OrderService();
      const order = await orderService.getByOrderId(orderId);

      const customerInfo = {
        email: order?.userId?.email || req.user?.email || '',
        name: order?.userId?.username || req.user?.username || 'לקוח',
        phone: order?.userId?.phone || req.user?.phone || '',
      };

      const { iframeUrl, amount } = TranzilaService.buildIframeUrl({
        orderId,
        items,
        baseUrl,
        terminal,
        customerInfo,
      });
      res.json({ iframeUrl, amount });
    } catch (err) {
      next(err);
    }
  }

  static async webhook(req, res) {
    // תמיד מחזירים 200 ל-gateway, מתעדים אצלנו
    try {
      const payload = req.validated ?? req.body ?? {};
      const { orderid, transaction_index, sum, currency } = payload;

      console.log('[TRZ][WEBHOOK] got:', {
        orderid, transaction_index, sum, currency, keys: Object.keys(payload)
      });

      const orderService = new OrderService();

      // שלב 1: הבאת הזמנה
      const order = await orderService.getByOrderId(orderid).catch((err) => {
        console.error('[TRZ][WEBHOOK] getByOrderId error:', err.message);
        return null;
      });

      if (!order) {
        console.warn('[TRZ][WEBHOOK] order not found:', orderid);
        return res.status(200).send('OK');
      }

      // אידמפוטנטיות: אם כבר שולם – לא עושים שוב
      if (order.payment?.status === 'paid') {
        await orderService.logGatewayEvent(orderid, {
          gateway: 'tranzila',
          event: 'duplicate_webhook',
          payload
        }).catch(() => { });
        return res.status(200).send('OK');
      }

      // ---- מצב TEST: לא מתקשרים לטרנזילה בכלל, תמיד מאשרים ----
      const isTest = process.env.TRZ_ENV === 'test';

      let approved = false;
      let verification = null;

      if (isTest) {
        approved = true;
        verification = {
          mode: 'test-auto-approve',
          approved: true,
          status: 'approved',
          response: '000',
          transaction_index,
        };
      } else {
        // ---- מצב PRODUCTION: אימות אמיתי מול Tranzila ----
        verification = await TranzilaService.verifyTransaction({ transaction_index });

        approved =
          verification?.approved === true ||
          verification?.status === 'approved' ||
          verification?.response === '000';
      }

      if (!approved) {
        console.warn('[TRZ][WEBHOOK] not approved:', { orderid, transaction_index, verification });

        await orderService.logGatewayEvent(orderid, {
          gateway: 'tranzila',
          event: 'not_approved',
          payload,
          verification
        }).catch(() => { });
        return res.status(200).send('OK');
      }

      // שלב 3: (אופציונלי) בדיקת התאמת סכום/מטבע
      try {
        const orderTotal = Number(order.totalAmount ?? order.total ?? 0);
        if (sum && isFinite(orderTotal) && Number(sum) !== orderTotal) {
          console.warn('[TRZ][WEBHOOK] amount mismatch', { orderid, sum, orderTotal });
        }
      } catch (e) {
        console.error('[TRZ][WEBHOOK] amount check error:', e.message);
      }

      // שלב 4: סימון בתשלום + תיעוד גולמי + עדכון מלאי (ב-markPaid)
      await orderService.markPaid(orderid, {
        gateway: 'tranzila',
        transaction_index,
        payload,
        verification,
      });

      console.log('[TRZ][WEBHOOK] markPaid done for order:', orderid);
      try {
        const fullOrder = await orderService.getByOrderId(orderid); // 👈 כאן יש populate של user & address
        if (fullOrder) {
          await sendOrderCreatedEmails(fullOrder);
        } else {
          console.warn("[TRZ][WEBHOOK] no order found for emails:", orderid);
        }
      } catch (mailErr) {
        console.error("[TRZ][WEBHOOK] sendOrderCreatedEmails error:", mailErr);
        // לא זורקים שגיאה כדי לא להפיל את ה-200 ל-Tranzila
      }
      return res.status(200).send('OK');
    } catch (e) {
      console.error('[TRZ][WEBHOOK][ERR]', e);
      return res.status(200).send('OK');
    }
  }
}
