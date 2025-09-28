// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export async function sendResetEmail(to, resetLink) {
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // או smtp אחר לפי הצורך
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//    from: '"Express48 Support" <noreply@express48>', // ✅ שולח בשם אחר
//     to,
//     subject: "איפוס סיסמה",
//     html: `
//       <p>קיבלת בקשה לאיפוס סיסמה.</p>
//       <p>כדי לאפס את הסיסמה שלך, לחץ על הקישור הבא:</p>
//       <a href="${resetLink}">${resetLink}</a>
//       <p>הקישור יהיה בתוקף למשך 15 דקות.</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// }


// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import path from "path"; // נוסיף תמיכה בנתיב לקובץ
// dotenv.config();

// export async function sendResetEmail(to, resetLink) {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: '"Express48 Support" <tech@express48.co.il>',
//     to,
//     subject: "איפוס סיסמה",
//     html: `
//       <div style="direction: rtl; font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; color: #333;">
//         <div style="background-color: #fff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
//           <h2 style="color: #0b2a4a;">איפוס סיסמה</h2>
//           <p>קיבלת בקשה לאיפוס סיסמה.</p>
//           <p>כדי לאפס את הסיסמה שלך, לחץ על הקישור הבא:</p>
//           <p><a href="${resetLink}" style="color: #007BFF;">${resetLink}</a></p>
//           <p>הקישור יהיה בתוקף למשך 15 דקות.</p>
//           <hr style="margin: 30px 0;">
//           <div style="text-align: center;">
//             <img src="cid:logo_cid" alt="Express48 Logo" style="height: 50px; opacity: 0.8;" />
//           </div>
//         </div>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: "logo.png",
//         path: path.resolve("assets/logo.png"), // התאימי לנתיב אצלך
//         cid: "logo_cid",
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);
// }





