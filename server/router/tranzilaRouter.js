
// // server/router/tranzilaRouter.js
// import { Router } from 'express';
// import bodyParser from 'body-parser';
// import { TranzilaController } from '../controllers/tranzilaController.js';

// const router = Router();

// /**
//  * POST /payments/tranzila/iframe-url
//  * מקבל { orderId, items } מהפרונט ומחזיר { iframeUrl, amount }
//  */
// router.post('/iframe-url', TranzilaController.startIframe);

// /**
//  * POST /payments/tranzila/webhook
//  * כתובת שחוזרת מטרנזילה אחרי תשלום (אם הגדרת אצלם)
//  */
// router.post(
//   '/webhook',
//   bodyParser.urlencoded({ extended: false }),
//   TranzilaController.webhook
// );

// // אופציונלי – debug לבדוק שהנתיב עובד
// router.get('/debug', (req, res) => {
//   console.log('[TRZ] /payments/tranzila/debug HIT');
//   res.json({ ok: true });
// });

// export default router;

import { Router } from 'express';
import bodyParser from 'body-parser';
import { TranzilaController } from '../controllers/tranzilaController.js';

const router = Router();

/**
 * POST /payments/tranzila/iframe-url
 * נשאר כמו שהיה
 */
router.post('/iframe-url', TranzilaController.startIframe);

/**
 * POST /payments/tranzila/hosted-fields/start
 * חדש - מחזיר thtk + נתונים לפרונט
 */
router.post('/hosted-fields/start', TranzilaController.startHostedFields);

/**
 * POST /payments/tranzila/webhook
 * אותו webhook - רק מאפשרים גם JSON
 */
router.post(
  '/webhook',
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json({ limit: '1mb' }),
  TranzilaController.webhook
);

router.get('/debug', (req, res) => {
  console.log('[TRZ] /payments/tranzila/debug HIT');
  res.json({ ok: true });
});

export default router;
