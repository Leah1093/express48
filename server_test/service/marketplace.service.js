// services/marketplace.service.js
import httpError from "http-errors";
import { Seller } from "../models/seller.js";
import { User } from "../models/user.js";
import { Store } from "../models/store.js";
import { sendNewSellerRequestToAdmin } from "../utils/email/sendNewSellerRequestToAdmin.js";
import { sendSellerRequestStatusEmail } from "../utils/email/sendSellerRequestStatusEmail.js";
import { sendSellerRequestReceivedEmail } from "../utils/email/sendSellerRequestReceivedEmail.js";
import { syncUserSessions } from "./sessionSync.service.js";

async function ensureStoreForSeller(seller, adminUserId) {
  // לא ליצור כפילות
  console.log(seller)
  const exists = await Store.findOne({ sellerId: seller._id });
  if (exists) return exists;

  // שם לחנות
  const storeName =
    seller.companyName?.trim() ||
    seller.fullName?.trim() ||
    (seller.email?.split("@")[0] || "store");

  const store = await Store.create({
    sellerId: seller._id,
    userId: seller.userId,
    name: storeName,              // slug יופק אוטומטית מההוק
    status: "draft",              // המוכר יפרסם כשמוכן
    contactEmail: seller.email,
    phone: seller.phone || "",
    lastAction: { by: adminUserId, role: "admin", at: new Date(), action: "auto-create-on-approve" },
  });

  return store;
}


export class MarketplaceService {
  async createSeller(data) {
    const exists = await Seller.findOne({ userId: data.userId });
    if (exists) throw httpError(409, "כבר קיים Seller למשתמש זה");

    const seller = await Seller.create(data);

    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(s => s.trim());
    const adminLink = `${process.env.FRONTEND_URL}/admin/sellers?search=${encodeURIComponent(seller.email)}`;

    const adminSellerPayload = {
      name: seller.fullName || seller.companyName,
      email: seller.email,
      phone: seller.phone,
    };

    (async () => {
      try {
        await sendNewSellerRequestToAdmin({
          adminEmails,
          seller: adminSellerPayload,
          adminLink,
        });
      } catch (e) { console.warn("sendNewSellerRequestToAdmin failed:", e.message); }

      try {
        await sendSellerRequestReceivedEmail(seller.userId);
      } catch (e) { console.warn("sendSellerRequestReceivedEmail failed:", e.message); }
    })();

    return seller;
  }

  async updateSeller({ sellerId, data, actor }) {
    const seller = await Seller.findById(sellerId);
    if (!seller) throw httpError(404, "Seller לא נמצא");

    const isAdmin = actor?.role === "admin";
    const isOwner = String(seller.userId) === String(actor?.userId);
    if (!isAdmin && !isOwner) throw httpError(403, "אין הרשאה לעדכן Seller שאינו שלך");

    Object.assign(seller, data);
    await seller.save();
    return seller;
  }

  getSellerByUserId(userId) {
    if (!userId) return null;
    return Seller.findOne({ userId });
  }

  async listSellers({ status, q, limit = 20, page = 1 }) {
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { companyName: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const [items, total] = await Promise.all([
      Seller.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Seller.countDocuments(filter),
    ]);
    console.log("items", items)
    return { items, total, page, limit };
  }

  async adminUpdateSellerStatus({ id, status, note, adminUserId }) {
    const seller = await Seller.findById(id);
    if (!seller) throw httpError(404, "Seller לא נמצא");

    seller.status = status;
    seller.lastAction = { by: adminUserId, at: new Date(), status, note: note || "" };
    await seller.save();

    (async () => {
      try {
        const dashboardLink = `${process.env.FRONTEND_URL}/seller/dashboard`;
        await sendSellerRequestStatusEmail(seller.userId, { status, reason: note, dashboardLink });
      } catch (e) { console.warn("sendSellerRequestStatusEmail failed:", e.message); }
    })();
    console.log("hi")
    if (status === "approved") {
      const user = await User.findById(seller.userId);
      if (user && user.role !== "seller") {
        user.role = "seller";
        await user.save();
      }
      console.log("hi hi")

      await ensureStoreForSeller(seller, adminUserId);
      await syncUserSessions(seller.userId);
    }

    return seller;
  }
}


