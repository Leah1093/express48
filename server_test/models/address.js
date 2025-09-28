
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    zip: { type: String },
    isDefault: { type: Boolean, default: false },
    notes: { type: String, default: "" } 
}, { timestamps: true });

export const Address = mongoose.model("Address", addressSchema);
