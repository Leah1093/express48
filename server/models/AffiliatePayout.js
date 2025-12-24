import mongoose from "mongoose";

const AffiliatePayoutSchema = new mongoose.Schema(
  {
    affiliateCode: { type: String, required: true, index: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ILS" },

    status: {
      type: String,
      enum: ["requested", "approved", "processing", "paid", "rejected", "failed"],
      default: "requested",
      index: true,
    },

    method: {
      type: String,
      enum: ["bank", "paypal", "bit", "paybox"],
      required: true,
    },

    payoutDetailsSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },

    commissionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AffiliateCommission", required: true },
    ],

    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },

    providerRef: { type: String, default: null },
    adminNote: { type: String, default: null },
    note: { type: String, default: null },
  },
  { timestamps: true }
);

AffiliatePayoutSchema.index({ affiliateCode: 1, createdAt: -1 });

export const AffiliatePayout =
  mongoose.models.AffiliatePayout || mongoose.model("AffiliatePayout", AffiliatePayoutSchema);
