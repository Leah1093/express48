// server/controllers/tranzilaController.js
import { OrderService } from '../services/orderService.js';
import { TranzilaService } from '../services/tranzilaService.js';
import { CustomError } from '../utils/CustomError.js';

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
      if (!terminal) {
        throw new CustomError('Payment configuration missing (terminal)', 500);
      }

      const orderService = new OrderService();
      const order = await orderService.getByOrderId(orderId).catch(() => null);

      const customerInfo = {
        email: order?.userId?.email || req.user?.email || '',
        name: order?.userId?.username || req.user?.username || 'לקוח',
        phone: order?.userId?.phone || req.user?.phone || '',
      };

      const { iframeUrl, amount } = TranzilaService.buildIframeUrl({
        orderId,
        items,
        terminal,
        customerInfo,
      });

      return res.json({ iframeUrl, amount });
    } catch (err) {
      next(err);
    }
  }

  static async webhook(req, res) {
    try {
      const payload = req.validated ?? req.body ?? {};
      const { orderid, transaction_index, sum, currency } = payload;
      console.log('[TRZ][WEBHOOK] got:', {
        orderid,
        transaction_index,
        sum,
        currency,
        keys: Object.keys(payload),
      });
      const orderService = new OrderService();
      const order = await orderService.getByOrderId(orderid).catch(() => null);
      if (!order) {
        console.warn('[TRZ][WEBHOOK] order not found:', orderid);
        return res.status(200).send('OK');
      }
      if (order.payment?.status === 'paid') {
        await orderService
          .logGatewayEvent(orderid, {
            gateway: 'tranzila',
            event: 'duplicate_webhook',
            payload,
          })
          .catch(() => {});
        return res.status(200).send('OK');
      }
      const verification = await TranzilaService.verifyTransaction({
        transaction_index,
      });
      const approved =
        verification?.approved === true ||
        verification?.status === 'approved' ||
        verification?.response === '000';
      if (!approved) {
        console.warn('[TRZ][WEBHOOK] not approved:', {
          orderid,
          transaction_index,
          verification,
        });
        await orderService
          .logGatewayEvent(orderid, {
            gateway: 'tranzila',
            event: 'not_approved',
            payload,
            verification,
          })
          .catch(() => {});
        return res.status(200).send('OK');
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
      await orderService.markPaid(orderid, {
        gateway: 'tranzila',
        transaction_index,
        payload,
        verification,
      });
      // שליחת מיילים אחרי תשלום
      try {
        const { sendOrderCreatedEmails } = await import('../utils/email/orderEmails.js');
        await sendOrderCreatedEmails(orderid);
      } catch (e) {
        console.error('[TRZ][WEBHOOK] Failed to send order emails', e);
      }
      return res.status(200).send('OK');
    } catch (e) {
      console.error('[TRZ][WEBHOOK][ERR]', e);
      return res.status(200).send('OK');
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
        const { sendOrderCreatedEmails } = await import('../utils/email/orderEmails.js');
        await sendOrderCreatedEmails(orderId);
      } catch (e) {
        console.error('[TRZ][CONFIRM] Failed to send order emails', e);
      }
      return res.json({ success: true, message: 'Payment confirmed', orderId });
    } catch (err) {
      next(err);
    }
  }
}

