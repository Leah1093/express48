import express from 'express';
import ContactController from '../controllers/contact.controller.js';
import { contactLimiter } from '../middlewares/contactLimiter.js';
import { verifyRecaptcha } from '../middlewares/verifyRecaptcha.js';

const contactRouter = express.Router();
const contactController = new ContactController();

contactRouter.post('/send',contactLimiter,verifyRecaptcha, contactController.sendMessage);

export { contactRouter };
