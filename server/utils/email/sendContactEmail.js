import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

export async function sendContactEmail({ name, email, message }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name} דרך Express48" <${process.env.EMAIL_USER}>`,
    replyTo: email,
    to:  "support@express48.co.il"|| process.env.EMAIL_USER ,
    subject: `פנייה חדשה מהאתר - ${name}`,
    html: `
      <div style="direction: rtl; font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; color: #333;">
        <div style="background-color: #fff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #0b2a4a;">פנייה חדשה מ-${name}</h2>
          <p><strong>שם השולח:</strong> ${name}</p>
          <p><strong>אימייל:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>הודעה:</strong></p>
          <p>${message}</p>
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
