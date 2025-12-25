import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// יצירת טרנספורטר דינמי: אם יש SMTP_HOST נשתמש בו, אחרת gmail
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
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
  // עדיפות לכתובת מה-ENV, אחרת noreply דיפולטי
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || '"noreply" <noreply@express48.co.il>';
  const mailOptions = {
    from,
    to,
    subject,
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
