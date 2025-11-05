import { sendContactEmail } from "../utils/email/sendContactEmail.js";
import { ContactMessage } from "../models/contactMessage.js";
import { CustomError } from "../utils/CustomError.js";

export class ContactService {
  async handleMessage({ name, email, message, phone, honeypot }) {
    // 1. חסימת בוטים
    if (honeypot) {
      throw new CustomError("ניסיון שליחת בוט נחסם", 400);
    }

    // 2. ולידציה בסיסית
    if (!name || !email || !message) {
      throw new CustomError("שם, אימייל והודעה נדרשים", 400);
    }

    const data = { name, email, message, phone };

    // 3. שליחת מייל
    try {
      await sendContactEmail({ name, email, message });
    } catch (err) {
      throw new CustomError("כשלון בשליחת מייל לשירות לקוחות", 500, err);
    }

    // 4. שמירה במסד
    try {
      const saved = await ContactMessage.create(data);
      return saved;
    } catch (err) {
      throw new CustomError("כשלון בשמירת פנייה במסד נתונים", 500, err);
    }
  }
}
