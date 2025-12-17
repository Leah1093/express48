// import { OrderService } from '../services/orderService.js';
// import { TranzilaService } from '../services/tranzilaService.js';
// import { CustomError } from '../utils/CustomError.js';
// import { sendOrderCreatedEmails } from "../utils/email/orderEmails.js";

// export class TranzilaController {
//   static async startIframe(req, res, next) {
//     try {
//       const payload = req.validated ?? req.body ?? {};
//       const { orderId, items } = payload;

//       if (!orderId) {
//         throw new CustomError('Missing orderId', 400);
//       }

//       if (!Array.isArray(items) || items.length === 0) {
//         throw new CustomError('No items selected', 400);
//       }

//       const terminal = process.env.TRANZILA_TERMINAL;
//       const baseUrl = process.env.BASE_URL;

//       if (!terminal || !baseUrl) {
//         throw new CustomError('Payment configuration missing', 500);
//       }

//       const orderService = new OrderService();
//       const order = await orderService.getByOrderId(orderId);


//       const customerInfo = {
//         email: order?.userId?.email || req.user?.email || '',
//         name: order?.userId?.username || req.user?.username || 'לקוח',
//         phone: order?.userId?.phone || req.user?.phone || '',
//       };

//       const { iframeUrl, amount } = TranzilaService.buildIframeUrl({
//         orderId,
//         items,
//         baseUrl,
//         terminal,
//         customerInfo,
//       });
//       res.json({ iframeUrl, amount });

//     } catch (err) {
//       next(err);
//     }
//   }

//    static async webhook(req, res) {

//     try {
//       // טרנזילה שולחים form-urlencoded → bodyParser.urlencoded כבר מטפל בזה
//       const payload = req.body || {};
//       console.log("[TRZ][WEBHOOK] RAW PAYLOAD:", payload);

//       // בד"כ השדות האלה מגיעים מטרנזילה
//       const orderid =
//         payload.orderid || payload.orderId || payload.OrderId;
//       const respCode =
//         payload.Response || payload.response;

//       console.log("[TRZ][WEBHOOK] parsed:", { orderid, respCode });

//       const orderService = new OrderService();

//       if (!orderid) {
//         console.warn("[TRZ][WEBHOOK] missing orderid in payload");
//         return res.status(200).send("OK");
//       }

//       // אם אין קוד תשובה – רק מתעדים
//       if (!respCode) {
//         console.warn("[TRZ][WEBHOOK] missing Response code", { orderid });
//         await orderService
//           .logGatewayEvent(orderid, {
//             gateway: "tranzila",
//             event: "webhook_no_response_code",
//             payload,
//           })
//           .catch(() => {});
//         return res.status(200).send("OK");
//       }

//       // ✅ "000" = עסקה מאושרת לפי טרנזילה
//       const isApproved = String(respCode) === "000";

//       if (!isApproved) {
//         console.warn("[TRZ][WEBHOOK] not approved:", {
//           orderid,
//           respCode,
//         });

//         await orderService
//           .logGatewayEvent(orderid, {
//             gateway: "tranzila",
//             event: "not_approved",
//             payload,
//             respCode,
//           })
//           .catch(() => {});
//         return res.status(200).send("OK");
//       }

//       // עד כאן רק בדיקה. מכאן – העסקה מאושרת ✔

//       // שולפים את ההזמנה
//       const existing = await orderService
//         .getByOrderId(orderid)
//         .catch(() => null);

//       if (!existing) {
//         console.warn("[TRZ][WEBHOOK] order not found:", orderid);
//         return res.status(200).send("OK");
//       }

//       // אם כבר שולם – לא מסמנים שוב
//       if (existing.payment?.status === "paid") {
//         console.log(
//           "[TRZ][WEBHOOK] order already paid, skipping:",
//           orderid
//         );
//         await orderService
//           .logGatewayEvent(orderid, {
//             gateway: "tranzila",
//             event: "duplicate_webhook",
//             payload,
//           })
//           .catch(() => {});
//         return res.status(200).send("OK");
//       }

//       // 👇 כאן קורה בפועל:
//       // - סימון ההזמנה כ-paid
//       // - עדכון מלאי
//       // - הגדלת purchases
//       await orderService.markPaid(orderid, {
//         gateway: "tranzila",
//         payload,
//         responseCode: respCode,
//       });

//       console.log(
//         "[TRZ][WEBHOOK] markPaid done for order:",
//         orderid
//       );

//       // שליחת מיילים – משתמשת ב-fullOrder עם populate
//       try {
//         const fullOrder = await orderService.getByOrderId(orderid);
//         if (fullOrder) {
//           await sendOrderCreatedEmails(fullOrder);
//         } else {
//           console.warn(
//             "[TRZ][WEBHOOK] no order found for emails:",
//             orderid
//           );
//         }
//       } catch (mailErr) {
//         console.error(
//           "[TRZ][WEBHOOK] sendOrderCreatedEmails error:",
//           mailErr
//         );
//       }

//       return res.status(200).send("OK");
//     } catch (e) {
//       console.error("[TRZ][WEBHOOK][ERR]", e);
//       // לטרנזילה תמיד מחזירים 200 כדי שלא יחזרו שוב ושוב
//       return res.status(200).send("OK");
//     }
//   }
// }

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
      // טרנזילה יכולים לשלוח urlencoded או JSON
      const payload = req.body || {};
      console.log("[TRZ][WEBHOOK] RAW PAYLOAD:", payload);

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

      console.log("[TRZ][WEBHOOK] parsed:", { orderid, respCode });

      const orderService = new OrderService();

      if (!orderid) {
        console.warn("[TRZ][WEBHOOK] missing orderid in payload");
        return res.status(200).send("OK");
      }

      if (!respCode) {
        console.warn("[TRZ][WEBHOOK] missing Response code", { orderid });
        await orderService
          .logGatewayEvent(orderid, {
            gateway: "tranzila",
            event: "webhook_no_response_code",
            payload,
          })
          .catch(() => {});
        return res.status(200).send("OK");
      }

      const isApproved = String(respCode) === "000";

      if (!isApproved) {
        console.warn("[TRZ][WEBHOOK] not approved:", {
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

      const existing = await orderService
        .getByOrderId(orderid)
        .catch(() => null);

      if (!existing) {
        console.warn("[TRZ][WEBHOOK] order not found:", orderid);
        return res.status(200).send("OK");
      }

      if (existing.payment?.status === "paid") {
        console.log("[TRZ][WEBHOOK] order already paid, skipping:", orderid);
        await orderService
          .logGatewayEvent(orderid, {
            gateway: "tranzila",
            event: "duplicate_webhook",
            payload,
          })
          .catch(() => {});
        return res.status(200).send("OK");
      }

      await orderService.markPaid(orderid, {
        gateway: "tranzila",
        payload,
        responseCode: respCode,
      });

      console.log("[TRZ][WEBHOOK] markPaid done for order:", orderid);

      try {
        const fullOrder = await orderService.getByOrderId(orderid);
        if (fullOrder) {
          await sendOrderCreatedEmails(fullOrder);
        } else {
          console.warn("[TRZ][WEBHOOK] no order found for emails:", orderid);
        }
      } catch (mailErr) {
        console.error("[TRZ][WEBHOOK] sendOrderCreatedEmails error:", mailErr);
      }

      return res.status(200).send("OK");
    } catch (e) {
      console.error("[TRZ][WEBHOOK][ERR]", e);
      return res.status(200).send("OK");
    }
  }
}
