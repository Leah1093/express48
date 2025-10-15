import { ContactService } from "../service/contact.service.js";

export default class ContactController {
  async sendMessage(req, res, next) {
    try {
      const contactService = new ContactService();
      const saved = await contactService.handleMessage(req.body);

      res.status(200).json({
        success: true,
        message: "ההודעה נשלחה ונשמרה בהצלחה",
        data: saved,
      });
    } catch (err) {
      next(err);
    }
  }
}
