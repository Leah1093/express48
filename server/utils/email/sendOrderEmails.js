// server/utils/sendOrderEmails.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// פונקציה מרכזית: שולחת מייל ללקוח + למנהל על הזמנה ששולמה
export async function sendOrderEmails(order) {
  try {
    const customerEmail = order?.userId?.email;
    const customerName = order?.userId?.username || "לקוח";
    const adminEmail =
      process.env.ORDERS_ADMIN_EMAIL || process.env.EMAIL_USER; // אפשר להגדיר ב ENV

    if (!customerEmail && !adminEmail) {
      console.warn("[sendOrderEmails] no recipient emails");
      return;
    }

    const orderId = order._id?.toString();
    const totalAmount = order.totalAmount || 0;
    const createdAt = order.createdAt
      ? new Date(order.createdAt).toLocaleString("he-IL")
      : "";

    const address = order.addressId || {};
    const addressHtml = `
      <div style="margin-top:8px;font-size:13px;color:#333">
        <div>${address.fullName || ""}</div>
        <div>${address.street || ""} ${address.houseNumber || ""}</div>
        <div>${address.city || ""} ${address.zipCode || ""}</div>
        <div>${address.phone || ""}</div>
      </div>
    `;

    const itemsRows =
      Array.isArray(order.items) && order.items.length
        ? order.items
            .map((it) => {
              const title =
                it.snapshot?.title ||
                it.productName ||
                it.productTitle ||
                "מוצר";
              const qty = it.quantity || 0;
              const price = it.price || 0;
              const lineTotal = price * qty;

              return `
                <tr>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px">
                    ${title}
                  </td>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-size:13px">
                    ${qty}
                  </td>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:left;font-size:13px">
                    ₪${lineTotal.toLocaleString("he-IL")}
                  </td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="3" style="padding:8px;text-align:center;font-size:13px">
              אין פריטים להצגה
            </td>
          </tr>
        `;

    const baseSubject = `הזמנה חדשה מספר ${orderId}`;
    const baseHtml = `
      <div style="direction:rtl;font-family:Arial,sans-serif;background-color:#f7f7f7;padding:16px;color:#333">
        <div style="background-color:#fff;border-radius:8px;padding:20px;max-width:640px;margin:auto;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
          <h2 style="margin-top:0;margin-bottom:10px;color:#0b2a4a;font-size:20px">
            תודה על ההזמנה שלך
          </h2>
          <p style="margin:0 0 6px 0;font-size:14px">
            שלום ${customerName},
          </p>
          <p style="margin:0 0 12px 0;font-size:14px">
            ההזמנה שלך נקלטה במערכת וסומנה כשולמה.
          </p>

          <p style="margin:0 0 4px 0;font-size:13px">
            <strong>מספר הזמנה:</strong> ${orderId}
          </p>
          <p style="margin:0 0 4px 0;font-size:13px">
            <strong>תאריך:</strong> ${createdAt}
          </p>
          <p style="margin:0 0 12px 0;font-size:13px">
            <strong>סכום כולל:</strong> ₪${totalAmount.toLocaleString("he-IL")}
          </p>

          <h3 style="margin:16px 0 8px 0;font-size:15px;color:#0b2a4a">
            פרטי משלוח
          </h3>
          ${addressHtml}

          <h3 style="margin:20px 0 8px 0;font-size:15px;color:#0b2a4a">
            פרטי ההזמנה
          </h3>

          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;font-size:13px">מוצר</th>
                <th style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;font-size:13px">כמות</th>
                <th style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:13px">סהכ</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <p style="margin-top:18px;font-size:12px;color:#666">
            מייל זה נשלח אליך אוטומטית. אין להשיב להודעה זו.
          </p>
        </div>
      </div>
    `;

    const promises = [];

    // מייל ללקוח
    if (customerEmail) {
      promises.push(
        transporter.sendMail({
          from: `"Express48" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: baseSubject,
          html: baseHtml,
        })
      );
    }

    // מייל למנהל
    if (adminEmail) {
      promises.push(
        transporter.sendMail({
          from: `"Express48" <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: `התקבלה הזמנה חדשה במערכת - ${orderId}`,
          html: baseHtml,
        })
      );
    }

    await Promise.all(promises);
    console.log("[sendOrderEmails] sent order emails for", orderId);
  } catch (err) {
    console.error("[sendOrderEmails] ERROR:", err);
  }
}
