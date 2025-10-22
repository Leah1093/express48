import { Router } from 'express';
import bodyParser from 'body-parser';
import { TranzilaController } from '../controllers/payments/TranzilaController.js';
import { validate } from '../middlewares/validate.js';
import { startPaymentSchema } from '../validations/paymentSchema.js';

const paymentsRouter = Router();

paymentsRouter.post('/tranzila/iframe-url', validate(startPaymentSchema), TranzilaController.startIframe);

// ל־webhook נדרש urlencoded, ולא json
paymentsRouter.post('/tranzila/webhook', bodyParser.urlencoded({ extended: false }), TranzilaController.webhook);

export default paymentsRouter;
