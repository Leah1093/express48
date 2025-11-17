// services/marketplace.service.js
import { Seller } from "../models/seller.js";
import { User } from "../models/user.js";
import { Store } from "../models/store.js";
import { sendNewSellerRequestToAdmin } from "../utils/email/sendNewSellerRequestToAdmin.js";
import { sendSellerRequestStatusEmail } from "../utils/email/sendSellerRequestStatusEmail.js";
import { sendSellerRequestReceivedEmail } from "../utils/email/sendSellerRequestReceivedEmail.js";
import { syncUserSessions } from "./sessionSync.service.js";
import { CustomError } from "../utils/CustomError.js";

async function ensureStoreForSeller(seller, adminUserId) {
  const exists = await Store.findOne({ sellerId: seller._id });
  if (exists) return exists;

  const storeName =
    seller.companyName?.trim() ||
    seller.fullName?.trim() ||
    (seller.email?.split("@")[0] || "store");

  const store = await Store.create({
    sellerId: seller._id,
    userId: seller.userId,
    name: storeName, // slug יופק מההוק
    status: "draft",
    contactEmail: seller.email,
    phone: seller.phone || "",
    lastAction: {
      by: adminUserId,
      role: "admin",
      at: new Date(),
      action: "auto-create-on-approve",
    },
  });

  return store;
}

export class MarketplaceService {
  async createSeller(data) {
    const exists = await Seller.findOne({ userId: data.userId });
    if (exists) throw new CustomError("כבר קיים Seller למשתמש זה", 409);

    const seller = await Seller.create(data);

    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(s => s.trim());
    const adminLink = `${process.env.FRONTEND_URL}/admin/sellers?search=${encodeURIComponent(
      seller.email
    )}`;

    const adminSellerPayload = {
      name: seller.fullName || seller.companyName,
      email: seller.email,
      phone: seller.phone,
    };

    // שליחת מיילים – לא חוסם את הזרימה
    Promise.resolve()
      .then(() =>
        sendNewSellerRequestToAdmin({ adminEmails, seller: adminSellerPayload, adminLink })
      )
      .catch(e => console.warn("sendNewSellerRequestToAdmin failed:", e.message));

    Promise.resolve()
      .then(() => sendSellerRequestReceivedEmail(seller.userId))
      .catch(e => console.warn("sendSellerRequestReceivedEmail failed:", e.message));

    return seller;
  }

  async updateSeller({ sellerId, data, actor }) {
    const seller = await Seller.findById(sellerId);
    if (!seller) throw new CustomError("Seller לא נמצא", 404);

    const isAdmin = actor?.role === "admin";
    const isOwner = String(seller.userId) === String(actor?.userId);
    if (!isAdmin && !isOwner)
      throw new CustomError("אין הרשאה לעדכן Seller שאינו שלך", 403);

    Object.assign(seller, data);
    await seller.save();
    return seller;
  }

  getSellerByUserId(userId) {
    if (!userId) return null;
    return Seller.findOne({ userId });
  }

  async listSellers({ status, q, limit = 20, page = 1 }) {
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new CustomError("limit חייב להיות בין 1 ל־100", 400);
    }
    if (!Number.isInteger(page) || page <= 0) {
      throw new CustomError("page חייב להיות מספר חיובי", 400);
    }

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

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Seller.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Seller.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async adminUpdateSellerStatus({ id, status, note, adminUserId }) {
    const seller = await Seller.findById(id);
    if (!seller) throw new CustomError("Seller לא נמצא", 404);


    seller.status = status;
    seller.lastAction = {
      by: adminUserId,
      role: "admin",
      at: new Date(),
      action: "status-change",
      status,
      note: note || "",
    };
    await seller.save();

    Promise.resolve()
      .then(() =>
        sendSellerRequestStatusEmail(seller.userId, {
          status,
          reason: note,
          dashboardLink: `${process.env.FRONTEND_URL}/seller/dashboard`,
        })
      )
      .catch(e => console.warn("sendSellerRequestStatusEmail failed:", e.message));

    if (status === "approved") {
      const user = await User.findById(seller.userId);
      if (user && user.role !== "seller") {
        user.role = "seller";
        await user.save();
      }

      await ensureStoreForSeller(seller, adminUserId);
      await syncUserSessions(seller.userId);
    }

    return seller;
  }
}
