// server/utils/email/orderEmails.js
import { sendEmail } from "./sendEmail.js"; 
// 👈 אם אצלך הקובץ נקרא אחרת (email.js / mailer.js וכו') – תעדכני

const ADMIN_EMAIL = process.env.ADMIN_ORDERS_EMAIL || "orders@express48.co.il";

export async function sendOrderCreatedEmails(order) {
  try {
    const user = order.userId;
    const address = order.addressId;

    const subjectCustomer = `הזמנה חדשה מספר ${order._id}`;
    const subjectAdmin = `התקבלה הזמנה חדשה באתר (${order._id})`;

    const lines = (order.items || []).map((it) => {
      const title = it.title || it.productTitle || "";
      const qty = it.quantity;
      const price = it.price;
      return `- ${title} × ${qty} – ${price} ₪`;
    });

    const total = order.totalAmount;

    const addressText = address
      ? `\n\nכתובת משלוח:\n${address.fullName || ""}\n${address.street || ""} ${address.houseNumber || ""}\n${address.city || ""}${
          address.zipCode ? " " + address.zipCode : ""
        }`
      : "";

    const baseText =
      `פרטי הזמנה:\n` +
      lines.join("\n") +
      `\n\nסך הכל: ${total} ₪` +
      addressText +
      `\n\nמספר הזמנה: ${order._id}\n`;

    // מייל ללקוח
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: subjectCustomer,
        text:
          `שלום ${user.username || ""},\n\n` +
          `קיבלנו את ההזמנה שלך והיא נמצאת כעת בטיפול.\n\n` +
          baseText,
      });
    }

    // מייל למנהל
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: subjectAdmin,
      text:
        `התקבלה הזמנה חדשה מאת ${user?.username || ""} (${user?.email || ""}).\n\n` +
        baseText,
    });
  } catch (err) {
    console.error("[orderEmails] sendOrderCreatedEmails error:", err);
    throw err;
  }
}
