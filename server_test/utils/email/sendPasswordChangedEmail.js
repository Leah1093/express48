import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { User } from "../../models/user.js";

dotenv.config();

export async function sendPasswordChangedEmail(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"noreply" <noreply@express48.co.il>',
    to: user.email,
    subject: "הסיסמה שלך שונתה בהצלחה",
    html: `
      <div style="direction: rtl; font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; color: #333;">
        <div style="background-color: #fff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #0b2a4a;">הסיסמה שלך עודכנה</h2>
          <p>שלום ${user.firstName || 'משתמש'},</p>
          <p>הסיסמה שלך עודכנה בהצלחה במערכת Express48.</p>
          <p>אם לא אתה ביצעת את השינוי, מומלץ לפנות אלינו מיד.</p>
          <hr style="margin: 30px 0;">
          <div style="text-align: center;">
            <img src="cid:logo_cid" alt="Express48 Logo" style="height: 50px; opacity: 0.8;" />
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve("assets/logo.png"),
        cid: "logo_cid",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
