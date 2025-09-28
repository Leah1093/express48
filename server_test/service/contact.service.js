import { sendContactEmail } from '../utils/email/sendContactEmail.js';
import { ContactMessage } from '../models/contactMessage.js';

export class ContactService {
  async handleMessage({ name, email, message, phone }) {
    console.log("ContactService ✉️");

    // 1. שליחת מייל לשירות לקוחות
    await sendContactEmail({ name, email, message });

    // 2. שמירת הפנייה למסד נתונים
    await ContactMessage.create({
      name,
      email,
      phone,
      message,
    });
    console.log("✅ הפנייה נשמרה במסד נתונים");
  }
}

