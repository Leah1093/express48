import mongoose from "mongoose";

const AffiliateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ✅ status פעם אחת בלבד
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "blocked"],
      default: "draft",
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    commissionRate: {
      type: Number,
      default: 0.05,
      min: 0,
      max: 1,
    },

    terms: {
      // ✅ עדיף null כברירת מחדל, כדי שלא ייראה כאילו הסכים
      version: { type: String, default: null },
      acceptedAt: { type: Date, default: null },
      acceptedIp: { type: String, default: null },
      acceptedUserAgent: { type: String, default: null },

      confirmations: {
        programExplanation: { type: Boolean, default: false },
        noSelfPurchase: { type: Boolean, default: false },
        noMisleadingAds: { type: Boolean, default: false },
        privacyRules: { type: Boolean, default: false },
        payoutPolicy: { type: Boolean, default: false },
      },
    },

    joinedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    blockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const AffiliateProfile =
  mongoose.models.AffiliateProfile ||
  mongoose.model("AffiliateProfile", AffiliateProfileSchema);

// ---- Affiliate Click Tracking Models ----

const AffiliateClickSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true }, // YYYY-MM-DD

    ipHash: { type: String, required: true, index: true },
    uaHash: { type: String, required: true, index: true },

    path: { type: String, required: true },
    referrer: { type: String, default: null },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// TTL אופציונלי: מחיקה אחרי 180 יום
AffiliateClickSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 180 }
);

export const AffiliateClick =
  mongoose.models.AffiliateClick ||
  mongoose.model("AffiliateClick", AffiliateClickSchema);

const AffiliateClickUniqueSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true },

    ipHash: { type: String, required: true },
    uaHash: { type: String, required: true },

    firstPath: { type: String, default: null },
    firstReferrer: { type: String, default: null },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    firstSource: { type: String, default: null },
  },
  { timestamps: true }
);

// אותו fingerprint נספר פעם אחת ליום לשותף
AffiliateClickUniqueSchema.index(
  { code: 1, day: 1, ipHash: 1, uaHash: 1 },
  { unique: true }
);

// TTL אופציונלי: 180 יום
AffiliateClickUniqueSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 180 }
);

export const AffiliateClickUnique =
  mongoose.models.AffiliateClickUnique ||
  mongoose.model("AffiliateClickUnique", AffiliateClickUniqueSchema);

const AffiliateCommissionSchema = new mongoose.Schema(
  {
    orderMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    orderId: { type: String, required: true, index: true }, // ORD-...

    affiliateCode: { type: String, required: true, index: true }, // affiliateRef

    baseAmount: { type: Number, required: true }, // בד"כ paidAmount / totalAmount
    commissionRate: { type: Number, required: true }, // snapshot
    commissionAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "eligible", "paid", "void"],
      default: "pending",
      index: true,
    },

    paidAt: { type: Date, default: null },
    lockedForPayoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AffiliatePayout",
      default: null,
      index: true,
    },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ מונע כפילות: אותה הזמנה לאותו שותף פעם אחת בלבד
AffiliateCommissionSchema.index(
  { orderMongoId: 1, affiliateCode: 1},
  { unique: true }
);

export const AffiliateCommission =
  mongoose.models.AffiliateCommission ||
  mongoose.model("AffiliateCommission", AffiliateCommissionSchema);
