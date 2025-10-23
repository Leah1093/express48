import { Router } from 'express';
import bodyParser from 'body-parser';
import { TranzilaController } from '../controllers/payments/TranzilaController.js';
import { validate } from '../middlewares/validate.js';
import { startPaymentSchema, tranzilaWebhookSchema } from '../validations/paymentSchema.js';

const paymentsRouter = Router();

paymentsRouter.post('/tranzila/iframe-url', validate(startPaymentSchema), TranzilaController.startIframe);
paymentsRouter.post('/tranzila/webhook', bodyParser.urlencoded({ extended: false }), validate(tranzilaWebhookSchema), TranzilaController.webhook);

export default paymentsRouter;
