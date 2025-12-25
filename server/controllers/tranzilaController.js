import { OrderService } from '../services/orderService.js';
import { TranzilaService } from '../services/tranzilaService.js';
import { CustomError } from '../utils/CustomError.js';
import { sendOrderCreatedEmails } from "../utils/email/orderEmails.js";

export class TranzilaController {
  static async startIframe(req, res, next) {
    try {
      const payload = req.validated ?? req.body ?? {};
      const { orderId, items } = payload;

      if (!orderId) {
        throw new CustomError('Missing orderId', 400);
      }

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

      // תמיכה באורחים - אם יש guestAddress, נשתמש בו
      let customerEmail = '';
      let customerName = 'לקוח';
      let customerPhone = '';

      if (order?.userId) {
        // משתמש מחובר
        customerEmail = order.userId?.email || req.user?.email || '';
        customerName = order.userId?.username || req.user?.username || 'לקוח';
        customerPhone = order.userId?.phone || req.user?.phone || '';
      } else if (order?.guestAddress) {
        // אורח - נשתמש בכתובת האורח
        customerEmail = order.guestAddress?.email || '';
        customerName = order.guestAddress?.fullName || 'לקוח';
        customerPhone = order.guestAddress?.phone || '';
      } else {
        // fallback
        customerEmail = req.user?.email || '';
        customerName = req.user?.username || 'לקוח';
        customerPhone = req.user?.phone || '';
      }

      const customerInfo = {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
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

  /**
   * Hosted Fields - endpoint חדש שמחזיר thtk + params לפרונט
   * POST /payments/tranzila/hosted-fields/start
   */
  static async startHostedFields(req, res, next) {
    try {
      const payload = req.validated ?? req.body ?? {};
      const { orderId, items } = payload;

      if (!orderId) throw new CustomError('Missing orderId', 400);
      if (!Array.isArray(items) || items.length === 0) {
        throw new CustomError('No items selected', 400);
      }

      const baseUrl = process.env.BASE_URL;
      if (!baseUrl) throw new CustomError('Payment configuration missing', 500);

      const amount = TranzilaService.calcTotal(items);
      const { thtk, terminalName } = await TranzilaService.createHostedFieldsHandshake({ amount });

      const notifyUrl = `${baseUrl.replace(/\/+$/, '')}/payments/tranzila/webhook`;

      res.json({
        thtk,
        amount,
        terminalName,
        notifyUrl,
        orderId,
      });
    } catch (err) {
      next(err);
    }
  }

  static async webhook(req, res) {
    try {
      // שילוב לוגיקה: תמיכה גם ב-guestAddress, גם ב-response מהמיין, גם ב-logGatewayEvent, גם ב-sendOrderCreatedEmails
      const payload = req.validated ?? req.body ?? {};
      // תמיכה בכל סוגי השדות
      const orderid =
        payload.orderid ||
        payload.orderId ||
        payload.OrderId ||
        payload?.transaction_response?.orderid ||
        payload?.transaction_response?.orderId;

      const respCode =
        payload.Response ||
        payload.response ||
        payload?.transaction_response?.processor_response_code ||
        payload?.transaction_response?.response ||
        payload?.transaction_response?.Response;

      const { transaction_index, sum, currency } = payload;
      console.log('[TRZ][WEBHOOK] got:', {
        orderid,
        transaction_index,
        sum,
        currency,
        respCode,
        keys: Object.keys(payload),
      });
      const orderService = new OrderService();
      const order = await orderService.getByOrderId(orderid).catch(() => null);
      if (!orderid || !order) {
        console.warn('[TRZ][WEBHOOK] order not found or missing orderid:', orderid);
        return res.status(200).send('OK');
      }
      // בדיקת קוד תשובה
      if (!respCode) {
        await orderService
          .logGatewayEvent(orderid, {
            gateway: "tranzila",
            event: "webhook_no_response_code",
            payload,
          })
          .catch(() => {});
        return res.status(200).send("OK");
      }
      // בדיקת סכום (לא חובה אבל טוב ללוג)
      try {
        const orderTotal = Number(order.totalAmount ?? order.total ?? 0);
        if (sum && isFinite(orderTotal) && Number(sum) !== orderTotal) {
          console.warn('[TRZ][WEBHOOK] amount mismatch', {
            orderid,
            sum,
            orderTotal,
          });
        }
      } catch {}
      // בדיקת אישור
      const isApproved = String(respCode) === "000";
      if (!isApproved) {
        console.warn('[TRZ][WEBHOOK] not approved:', {
          orderid,
          respCode,
        });
        await orderService
          .logGatewayEvent(orderid, {
            gateway: "tranzila",
            event: "not_approved",
            payload,
            respCode,
          })
          .catch(() => {});
        return res.status(200).send("OK");
      }
      // אם כבר שולם – לא מסמנים שוב
      if (order.payment?.status === 'paid') {
        console.log('[TRZ][WEBHOOK] order already paid, skipping:', orderid);
        await orderService
          .logGatewayEvent(orderid, {
            gateway: "tranzila",
            event: "duplicate_webhook",
            payload,
          })
          .catch(() => {});
        return res.status(200).send("OK");
      }
      // סימון ההזמנה כ-paid
      await orderService.markPaid(orderid, {
        gateway: "tranzila",
        payload,
        responseCode: respCode,
      });
      // שליחת מיילים אחרי תשלום
      try {
        const fullOrder = await orderService.getByOrderId(orderid);
        if (fullOrder) {
          await sendOrderCreatedEmails(fullOrder);
        } else {
          console.warn('[TRZ][WEBHOOK] no order found for emails:', orderid);
        }
      } catch (e) {
        console.error('[TRZ][WEBHOOK] Failed to send order emails', e);
      }
      return res.status(200).send('OK');
    } catch (e) {
      console.error("[TRZ][WEBHOOK][ERR]", e);
      return res.status(200).send("OK");
    }
  }

  static async confirm(req, res, next) {
    try {
      const { orderId, transaction_index, responseCode, raw } = req.body;
      if (!orderId || !transaction_index) {
        return res.status(400).json({ success: false, message: 'Missing orderId or transaction_index' });
      }
      const orderService = new OrderService();
      const order = await orderService.getByOrderId(orderId).catch(() => null);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.payment?.status === 'paid') {
        return res.json({ success: true, message: 'Order already paid', orderId });
      }
      // אימות בסיסי
      if (responseCode && responseCode !== '000') {
        return res.status(400).json({ success: false, message: 'Payment not approved', responseCode });
      }
      await orderService.markPaid(orderId, {
        gateway: 'tranzila',
        transaction_index,
        responseCode,
        raw,
      });
      // שליחת מיילים אחרי תשלום
      try {
        const fullOrder = await orderService.getByOrderId(orderId);
        if (fullOrder) {
          await sendOrderCreatedEmails(fullOrder);
        }
      } catch (e) {
        console.error('[TRZ][CONFIRM] Failed to send order emails', e);
      }
      return res.json({ success: true, message: 'Payment confirmed', orderId });
    } catch (err) {
      next(err);
    }
  }
}
