// models/sellerStoreSettings.model.js
import mongoose from "mongoose";

const sellerStoreSettingsSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Seller", 
    required: true, 
    unique: true, 
    index: true 
  },

  // שירות לקוחות
  customerService: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true }
  },

  // מיתוג ותיאור
  logoUrl: { type: String, trim: true },
  description: { type: String }, // טקסט חופשי (אפשר לשמור HTML מה־ReactQuill)

  // באנרים של החנות
  storeBanner: {
    type: { type: String, enum: ["static", "video", "slider"], default: "static" },
    desktop: { type: String, trim: true }, // תמונה/וידאו
    mobile: { type: String, trim: true }
  },

  // באנרים לרשימת חנויות
  listBanner: {
    type: { type: String, enum: ["static", "video"], default: "static" },
    media: { type: String, trim: true }
  }

}, { timestamps: true });

export const SellerStoreSettings = mongoose.model("SellerStoreSettings", sellerStoreSettingsSchema);
