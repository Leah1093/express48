// server/utils/email/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// טרנספורטר כללי – אותו עיקרון כמו באיפוס סיסמה
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * שליחת מייל בסיסית
 * @param {{ to: string; subject: string; text?: string; html?: string }} params
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    throw new Error("sendEmail: 'to' is required");
  }
  if (!subject) {
    throw new Error("sendEmail: 'subject' is required");
  }

  const from = '"noreply" <noreply@express48.co.il>';

  const mailOptions = {
    from,
    to,
    subject,
    // אם יש html – נשתמש בו; אם לא, נשלח text
    text: text || (html ? undefined : ""),
    html: html || undefined,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("[sendEmail] sent:", {
    to,
    subject,
    messageId: info.messageId,
  });
  return info;
}
