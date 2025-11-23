import { Product } from "../models/product.js";
import httpError from "http-errors";

export class AdminProductsService {
  async listPending({ page = 1, limit = 20 }) {
    const query = { status: "pending", isDeleted: false };
    const [items, total] = await Promise.all([
      Product.find(query).sort("createdAt").skip((page - 1) * limit).limit(limit),
      Product.countDocuments(query),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async setStatus({ id, action, reason, adminId }) {
    const doc = await Product.findById(id);
    if (!doc) throw httpError(404, "Product not found");

    if (action === "approve") {
      doc.status = "published";
      doc.publishedAt = new Date();
      doc.rejectedReason = undefined;
    } else if (action === "reject") {
      doc.status = "draft";
      doc.rejectedReason = reason || "Rejected by admin";
    } else if (action === "hide") {
      doc.status = "hidden";
    } else if (action === "archive") {
      doc.status = "archived";
    } else {
      throw httpError(400, "Invalid action");
    }

    // אופציונלי: לוג אודיט
    doc._lastModeratedBy = adminId; // אם תרצה לשמור
    return doc.save();
  }
}
