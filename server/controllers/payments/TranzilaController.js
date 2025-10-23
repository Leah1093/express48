import { OrderService } from '../../service/orderService.js';
import { TranzilaService } from '../../service/payments/TranzilaService.js';
import { CustomError } from '../../utils/CustomError.js';

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

      const { iframeUrl, amount } = TranzilaService.buildIframeUrl({
        orderId, items, baseUrl, terminal,
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

      // שלב 1: הבאת הזמנה (אופציונלי אך מומלץ)
      const order = await OrderService.getByOrderId?.(orderid).catch(() => null);
      if (!order) {
        console.warn('[TRZ][WEBHOOK] order not found:', orderid);
        return res.status(200).send('OK');
      }

      // אידמפוטנטיות: אם כבר שולם – רק נרשום את האירוע ונסיים
      if (order.payment?.status === 'paid') {
        await OrdersService.logGatewayEvent?.(orderid, {
          gateway: 'tranzila',
          event: 'duplicate_webhook',
          payload
        }).catch(() => { });
        return res.status(200).send('OK');
      }

      // שלב 2: אימות העסקה מול API (או mock/test)
      const verification = await TranzilaService.verifyTransaction({ transaction_index });

      const approved =
        verification?.approved === true ||
        verification?.status === 'approved' ||
        verification?.response === '000';

      if (!approved) {
        console.warn('[TRZ][WEBHOOK] not approved:', { orderid, transaction_index, verification });
        // לא מסמנים כ-paid, רק מתעדים
        await OrdersService.logGatewayEvent?.(orderid, {
          gateway: 'tranzila',
          event: 'not_approved',
          payload,
          verification
        }).catch(() => { });
        return res.status(200).send('OK');
      }

      // שלב 3: (אופציונלי) בדיקת התאמת סכום/מטבע
      try {
        const orderTotal = Number(order.totals?.grand ?? order.total ?? 0);
        if (sum && isFinite(orderTotal) && Number(sum) !== orderTotal) {
          console.warn('[TRZ][WEBHOOK] amount mismatch', { orderid, sum, orderTotal });
        }
      } catch { }

      // שלב 4: סימון בתשלום + תיעוד גולמי
      await OrdersService.markPaid(orderid, {
        gateway: 'tranzila',
        transaction_index,
        payload,
        verification,
      });

      return res.status(200).send('OK');
    } catch (e) {
      console.error('[TRZ][WEBHOOK][ERR]', e);
      return res.status(200).send('OK');
    }
  }
}


