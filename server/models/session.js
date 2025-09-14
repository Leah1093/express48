// models/session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // ← שדות המטה־דאטה כדי שלא נצטרך DB בכל refresh:
    role: { type: String, default: null },
    roles: { type: [String], default: [] },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },


    refreshHash: { type: String, required: true },
    prevRefreshHash: { type: String },

    status: { type: String, enum: ["active", "revoked", "expired"], default: "active", index: true },
    expiresAt: { type: Date, required: true },

    lastUsedAt: { type: Date, default: Date.now, index: true },

    userAgent: { type: String },
    deviceName: { type: String },
    ipHash: { type: String },

    rotatingCounter: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true } // חשוב: timestamps
);

// אינדקסים
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // מחיקה אוטומטית
sessionSchema.index({ userId: 1, status: 1 }); // חיפושים לפי משתמש+סטטוס
sessionSchema.index({ lastUsedAt: -1 });       // שימושון אחרון
sessionSchema.index({ sessionId: 1 }, { unique: true }); // מזהה סשן ייחודי
sessionSchema.index({ userId: 1 });            // כל הסשנים של משתמש
sessionSchema.index({ status: 1 });            // חיפושים לפי סטטוס בלבד

export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
