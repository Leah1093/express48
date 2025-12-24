// server/router/tranzilaRouter.js
import { Router } from 'express';
import bodyParser from 'body-parser';
import { TranzilaController } from '../controllers/tranzilaController.js';

const router = Router();

/**
 * POST /payments/tranzila/iframe-url
 * מקבל { orderId, items } מהפרונט ומחזיר { iframeUrl, amount }
 */
router.post('/iframe-url', TranzilaController.startIframe);

/**
 * POST /payments/tranzila/webhook
 * כתובת שחוזרת מטרנזילה אחרי תשלום (אם הגדרת אצלם)
 */
router.post(
  '/webhook',
  bodyParser.urlencoded({ extended: false }),
  TranzilaController.webhook
);

/**
 * POST /payments/tranzila/confirm
 * אישור תשלום מהפרונט (idempotent)
 */
router.post('/confirm', TranzilaController.confirm);

// אופציונלי – debug לבדוק שהנתיב עובד
router.get('/debug', (req, res) => {
  console.log('[TRZ] /payments/tranzila/debug HIT');
  res.json({ ok: true });
});

export default router;

