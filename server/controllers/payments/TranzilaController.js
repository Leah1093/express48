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
    try {
      // payload מה־gateway. לדוגמה: req.body.transaction_index
      const payload = req.body || {};
      const transaction_index = Number(payload?.transaction_index || payload?.index);

      // מומלץ: אימות מול ה־API ואז סימון הזמנה כ־Paid
      // const verify = await TranzilaService.verifyTransaction({ transaction_index });
      // if (verify.approved) await OrdersService.markPaid(orderId, { transaction_index, gateway: 'tranzila' });

      // תמיד להחזיר 200 ולתעד לוגים בצד שלך
      res.status(200).send('OK');
    } catch {
      res.status(200).send('OK');
    }
  }
}
