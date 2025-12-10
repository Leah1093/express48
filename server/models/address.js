import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // לא חובה במונגוס – חובה ב-UI
    fullName: {
      type: String,
      required: false,
      trim: true,
    },

    // לא חובה במונגוס – חובה ב-UI
    phone: {
      type: String,
      required: false,
      trim: true,
    },

    country: {
      type: String,
      required: false,
      trim: true,
      default: "IL",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    houseNumber: {
      type: String,
      trim: true,
    },

    apartment: {
      type: String,
      trim: true,
    },

    zip: {
      type: String,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);
