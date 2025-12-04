// server/utils/email/orderEmails.js

import { sendEmail } from "./sendEmail.js";
import { Product } from "../../models/Product.js";
const ADMIN_EMAIL = process.env.ADMIN_ORDERS_EMAIL || "orders@express48.co.il";

function formatOrderDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeNumber(n, fallback = 0) {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function getItemUnitPrice(it, productDoc) {
  if (typeof it.price === "number") return it.price;
  if (typeof it.priceAfterDiscount === "number") return it.priceAfterDiscount;

  if (productDoc?.price && typeof productDoc.price.amount === "number") {
    return productDoc.price.amount;
  }

  return 0;
}

// סה"כ הזמנה
function calcOrderTotal(items = [], productMap = new Map()) {
  return items.reduce((sum, it) => {
    const productKey =
      it.productId && it.productId._id
        ? String(it.productId._id)
        : String(it.productId);

    const product = productMap.get(productKey) || null;
    const qty = safeNumber(it.quantity, 0);
    const unitPrice = getItemUnitPrice(it, product);
    return sum + qty * unitPrice;
  }, 0);
}

function buildOrderHtml({
  order,
  user,
  address,
  items,
  totalAmount,
  mode,
  productMap,
}) {
  const orderId = order._id?.toString() || "";
  const createdAt = formatOrderDate(order.createdAt);

  const customerName =
    user?.firstName || user?.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user?.username || user?.name || "";

  const customerEmail = user?.email || "";
  const customerPhone = address?.phone || user?.phone || user?.mobile || "";

  const title =
    mode === "customer" ? "תודה על ההזמנה שלך" : "התקבלה הזמנה חדשה באתר";

  const headlinePrefix =
    mode === "customer"
      ? `שלום ${customerName || ""},`
      : `התקבלה הזמנה חדשה מאת ${customerName || "לקוח"}.`;

  const adminExtra =
    mode === "admin"
      ? `
      <p style="margin:4px 0;font-size:14px">
        <strong>שם המזמין:</strong> ${customerName || "-"}
      </p>
      <p style="margin:4px 0;font-size:14px">
        <strong>אימייל המזמין:</strong> ${customerEmail || "-"}
      </p>
      <p style="margin:4px 0;font-size:14px">
        <strong>טלפון המזמין:</strong> ${customerPhone || "-"}
      </p>
    `
      : "";

  const addressHtml = address
    ? `
      <div style="margin-top:4px;font-size:14px;color:#111">
        <div>${address.fullName || customerName || ""}</div>
        <div>${address.street || ""} ${address.houseNumber || ""}</div>
        <div>${address.city || ""} ${address.zipCode || ""}</div>
        <div>${address.phone || ""}</div>
      </div>
    `
    : "";

  const rowsHtml =
    items && items.length
      ? items
          .map((it) => {
            const productKey =
              it.productId && it.productId._id
                ? String(it.productId._id)
                : String(it.productId);

            const product = productMap.get(productKey) || null;

            const productTitle = product?.title || product?.name || "מוצר";
            const variationAttributes = it.variationAttributes || {};
            const hasVariations =
              variationAttributes &&
              typeof variationAttributes === "object" &&
              Object.keys(variationAttributes).length > 0;

            const variationHtml = hasVariations
              ? `
      <div style="margin-top:4px;font-size:12px;color:#555;">
        ${Object.entries(variationAttributes)
          .map(
            ([key, value]) =>
              `<span style="display:inline-block;margin-left:8px;">
                <strong>${key}:</strong> ${value}
              </span>`
          )
          .join("")}
      </div>
    `
              : "";
            const qty = safeNumber(it.quantity, 0);
            const unitPrice = getItemUnitPrice(it, product);
            const lineTotal = qty * unitPrice;

            const imgUrl =
              (product?.images && product.images[0]) || product?.image || "";

            const imageHtml = imgUrl
              ? `
                <img src="${imgUrl}" alt="${productTitle}"
                     style="width:80px;height:80px;object-fit:contain;
                            border-radius:8px;background:#f7f7f7;
                            display:block;margin:0 auto;" />
              `
              : `
                <div style="width:80px;height:80px;border-radius:8px;
                            background:#f2f2f2;margin:0 auto;"></div>
              `;

            return `
        <tr>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;
               text-align:right;font-size:14px;">
      <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;">
        <tr>
          <!-- תמונה בצד ימין -->
          <td style="width:90px;text-align:right;vertical-align:middle;">
            ${imageHtml}
          </td>
          <!-- טקסט של המוצר משמאל לתמונה (עדיין RTL) -->
          <td style="padding-right:12px;text-align:right;vertical-align:middle;">
            <div style="font-size:14px;font-weight:500;line-height:1.4;">
              ${productTitle}
            </div>
            ${variationHtml}
          </td>
        </tr>
      </table>
    </td>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;
               text-align:center;font-size:14px;">
      ${qty}
    </td>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;
               text-align:center;font-size:14px;">
      ₪${unitPrice.toLocaleString("he-IL")}
    </td>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;
               text-align:center;font-size:14px;font-weight:600;">
      ₪${lineTotal.toLocaleString("he-IL")}
    </td>
  </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="4" style="padding:12px;text-align:center;font-size:14px;">
            אין פריטים להצגה
          </td>
        </tr>
      `;

  return `
  <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:820px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      
      <!-- פס עליון -->
      <div style="background:#ff6500;color:#fff;padding:14px 24px;text-align:right;">
        <div style="font-size:20px;font-weight:700;margin-bottom:4px;">
          ${title}
        </div>
        <div style="font-size:13px;">
          מספר הזמנה: ${orderId} · ${createdAt ? `תאריך: ${createdAt}` : ""}
        </div>
      </div>

      <!-- תוכן -->
      <div style="padding:24px;">
        <p style="margin:0 0 8px 0;font-size:14px;">
          ${headlinePrefix}
        </p>
        ${
          mode === "customer"
            ? `<p style="margin:0 0 16px 0;font-size:14px;">
                 קיבלנו את ההזמנה שלך והיא נמצאת כעת בטיפול.
               </p>`
            : ""
        }

        <p style="margin:0 0 4px 0;font-size:14px;">
          <strong>סכום כולל:</strong>
          ₪${safeNumber(totalAmount, 0).toLocaleString("he-IL")}
        </p>

        ${adminExtra}

        <!-- כתובת משלוח -->
        <h3 style="margin:18px 0 6px 0;font-size:15px;color:#111;">
          כתובת משלוח
        </h3>
        ${addressHtml}

        <!-- טבלת פרטי הזמנה -->
        <h3 style="margin:24px 0 10px 0;font-size:15px;color:#111;">
          פרטי ההזמנה
        </h3>

        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f7f9fb;">
              <th style="padding:10px 16px;text-align:right;font-size:14px;font-weight:600;border-bottom:1px solid #e1e5ee;">
                מוצר
              </th>
              <th style="padding:10px 16px;text-align:center;font-size:14px;font-weight:600;border-bottom:1px solid #e1e5ee;">
                כמות
              </th>
              <th style="padding:10px 16px;text-align:center;font-size:14px;font-weight:600;border-bottom:1px solid #e1e5ee;">
                מחיר
              </th>
              <th style="padding:10px 16px;text-align:center;font-size:14px;font-weight:600;border-bottom:1px solid #e1e5ee;">
                סה"כ
              </th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <p style="margin-top:18px;font-size:12px;color:#666;">
          מייל זה נשלח אליך אוטומטית. אין להשיב להודעה זו.
        </p>
      </div>

      <!-- פוטר -->
      <div style="background:#f7f7f7;padding:10px 16px;text-align:center;font-size:11px;color:#999;">
        © 2025 Express48 · כל הזכויות שמורות
      </div>
    </div>
  </div>
  `;
}

export async function sendOrderCreatedEmails(order) {
  try {
    if (!order) return;

    const user = order.userId || {};
    const address = order.addressId || {};
    const items = Array.isArray(order.items) ? order.items : [];

    const rawProductIds = items.map((it) => it.productId).filter(Boolean);

    const productIds = [
      ...new Set(
        rawProductIds.map((pid) => {
          if (typeof pid === "object" && pid._id) return pid._id;
          return pid;
        })
      ),
    ];

    let productMap = new Map();
    if (productIds.length) {
      const products = await Product.find({
        _id: { $in: productIds },
      }).select("title name images image price");

      productMap = new Map(products.map((p) => [p._id.toString(), p]));
    }

    const totalAmount =
      typeof order.totalAmount === "number"
        ? order.totalAmount
        : calcOrderTotal(items, productMap);

    const orderId = order._id?.toString() || "";

    const subjectCustomer = `תודה על ההזמנה שלך (מספר ${orderId})`;
    const subjectAdmin = `התקבלה הזמנה חדשה באתר (מספר ${orderId})`;

    const htmlCustomer = buildOrderHtml({
      order,
      user,
      address,
      items,
      totalAmount,
      mode: "customer",
      productMap,
    });

    const htmlAdmin = buildOrderHtml({
      order,
      user,
      address,
      items,
      totalAmount,
      mode: "admin",
      productMap,
    });

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: subjectCustomer,
        html: htmlCustomer,
      });
    }

    const adminTo = ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminTo) {
      await sendEmail({
        to: adminTo,
        subject: subjectAdmin,
        html: htmlAdmin,
      });
    }

    console.log("[orderEmails] sent order emails for", orderId);
  } catch (err) {
    console.error("[orderEmails] sendOrderCreatedEmails ERROR:", err);
  }
}
