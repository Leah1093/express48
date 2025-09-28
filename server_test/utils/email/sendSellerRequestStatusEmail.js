import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { User } from "../../models/user.js";

dotenv.config();

/**
 * status: 'approved' | 'rejected'
 * reason: מחרוזת אופציונלית להסבר בדחייה
 * dashboardLink: קישור ללוח המוכר לאחר אישור
 */
export async function sendSellerRequestStatusEmail(userId, { status, reason = "", dashboardLink = "" } = {}) {
  const user = await User.findById(userId);
  if (!user) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const isApproved = status === "approved";
  const subject = isApproved ? "בקשתך להיות מוכר אושרה" : "בקשתך להיות מוכר נדחתה";
  const bodyHtml = isApproved
    ? `
        <p>שלום ${user.firstName || "משתמש"},</p>
        <p>שמחים להודיע כי בקשתך להיות מוכר ב-Express48 <b>אושרה</b>.</p>
        <p>כעת ניתן להיכנס ללוח המוכר ולהתחיל לעבוד.</p>
        ${dashboardLink ? `<p><a href="${dashboardLink}">מעבר ללוח המוכר</a></p>` : ""}
      `
    : `
        <p>שלום ${user.firstName || "משתמש"},</p>
        <p>לאחר בדיקה, בקשתך להיות מוכר ב-Express48 <b>נדחתה</b>.</p>
        ${reason ? `<p>סיבה: ${reason}</p>` : ""}
        <p>ניתן להגיש בקשה מחודשת לאחר עדכון הפרטים.</p>
      `;

  const mailOptions = {
    from: '"noreply" <noreply@express48.co.il>',
    to: user.email,
    subject,
    html: `
      <div style="direction: rtl; font-family: Arial, sans-serif; background:#f7f7f7; padding:20px; color:#333;">
        <div style="background:#fff; border-radius:8px; padding:20px; max-width:600px; margin:auto; box-shadow:0 0 10px rgba(0,0,0,.08);">
          <h2 style="color:#0b2a4a; margin-top:0;">עדכון סטטוס בקשה</h2>
          ${bodyHtml}
          <hr style="margin:24px 0;">
          <div style="text-align:center;">
            <img src="cid:logo_cid" alt="Express48 Logo" style="height:50px; opacity:.85;" />
          </div>
        </div>
      </div>
    `,
    attachments: [
      { filename: "logo.png", path: path.resolve("assets/logo.png"), cid: "logo_cid" },
    ],
  };

  await transporter.sendMail(mailOptions);
}
