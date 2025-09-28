import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
export async function sendNewSellerRequestToAdmin({ adminEmails, seller, adminLink }) {
  if (!seller?.email) return;
  console.log("sendNewSellerRequestToAdmin")
  const to =
    Array.isArray(adminEmails)
      ? adminEmails.join(",")
      : (adminEmails || process.env.ADMIN_EMAILS || "").toString();

  if (!to) return; // אין למי לשלוח

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: '"noreply" <noreply@express48.co.il>',
    to,
    subject: `בקשה חדשה להיות מוכר – ${seller.name || seller.email}`,
    html: `
      <div style="direction: rtl; font-family: Arial, sans-serif; background:#f7f7f7; padding:20px; color:#333;">
        <div style="background:#fff; border-radius:8px; padding:20px; max-width:600px; margin:auto; box-shadow:0 0 10px rgba(0,0,0,.08);">
          <h2 style="color:#0b2a4a; margin-top:0;">בקשה חדשה למוכר</h2>
          <p>התקבלה בקשה חדשה ממוכר פוטנציאלי:</p>
          <ul style="line-height:1.8;">
            <li><b>שם:</b> ${seller.name || "-"}</li>
            <li><b>אימייל:</b> ${seller.email}</li>
            <li><b>טלפון:</b> ${seller.phone || "-"}</li>
            <li><b>תאריך:</b> ${new Date().toLocaleString("he-IL")}</li>
          </ul>
          ${adminLink ? `<p><a href="${adminLink}">צפייה בבקשה במערכת</a></p>` : ""}
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
