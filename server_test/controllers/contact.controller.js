import { ContactService } from '../service/contact.service.js';

export default class ContactController {
    async sendMessage(req, res, next) {
        console.log("ContactController 📩");
        try {
            const { name, email, message, honeypot, phone } = req.body;

            if (honeypot) {
                console.warn("❌ בוט זוהה באמצעות Honeypot");
                return res.status(400).json({ error: "ניסיון שליחת בוט נחסם" });
            }

            if (!name || !email || !message) {
                const error = new Error('שם, אימייל והודעה נדרשים');
                error.statusCode = 400;
                throw error;
            }

            const contactService = new ContactService();

            // שליחת מייל + שמירה למסד – הכל דרך ה־Service
            await contactService.handleMessage({ name, email, message, phone });

            res.status(200).json({ message: 'ההודעה נשלחה ונשמרה בהצלחה' });

        } catch (err) {
            next(err);
        }
    }
}
