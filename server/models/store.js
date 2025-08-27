import mongoose from "mongoose";
import { slugifyName } from "../utils/slugify.js";

const mediaSchema = new mongoose.Schema({
    kind: { type: String, enum: ["image", "video"], default: "image" },
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: "" },
}, { _id: false });

const storeSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    slugChanged: { type: Boolean, default: false },
    contactEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },

    // שירות לקוחות
    support: {
        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        whatsapp: { type: String, trim: true, default: "" },
        hours: { type: String, trim: true, default: "" },   // "א-ה 09:00-17:00"
        note: { type: String, trim: true, default: "" },
    },
    // draft = לפני פרסום; active = באוויר; suspended = הושהה
    status: {
        type: String,
        enum: ["draft", "active", "suspended"],
        default: "draft",
        index: true
    },


    // מיתוג ותיאור
    logo: { type: mediaSchema, default: undefined },
    bannerTypeStore: { type: String, enum: ["static", "video", "slider"], default: "static", index: true },
    storeBanner: { type: mediaSchema, default: undefined },
    mobileBanner: { type: mediaSchema, default: undefined },
    storeSlider: { type: [mediaSchema], default: [] },

    bannerTypeList: { type: String, enum: ["static", "video"], default: "static" },
    listBanner: { type: mediaSchema, default: undefined },

    description: { type: String, default: "" },
    // נראות
    appearance: {
        storeNamePosition: { type: String, enum: ["header", "over-banner", "hidden"], default: "header" },
        productsPerPage: { type: Number, min: 1, max: 1000, default: 24 },
        hideEmail: { type: Boolean, default: false },
        hidePhone: { type: Boolean, default: false },
        hideAddress: { type: Boolean, default: false },
        hideAbout: { type: Boolean, default: false },
    },
    publishedAt: { type: Date },
    // עקבות (כולל role לאדמין-אוברייד)
    lastAction: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "seller"], default: "seller" },
        at: { type: Date },
        action: { type: String, trim: true },
        note: { type: String, trim: true, default: "" },
    },
}, { timestamps: true });

storeSchema.index({ sellerId: 1, userId: 1 });

// יצירת slug אוטומטית לפי השם (עם transliteration)
storeSchema.pre("validate", function (next) {
    if (!this.slug && this.name) this.slug = slugifyName(this.name);
    next();
});

storeSchema.pre("save", async function (next) {
    if (!this.isModified("slug")) return next();
    if (this.lastAction?.role === "admin") return next();
    // שליפת המצב הקודם מה-DB
    const prev = await this.constructor.findById(this._id).select("slugChanged status").lean();

    const statusWas = prev?.status ?? this.status;          // אם חדש – נשתמש בנוכחי
    const alreadyChanged = !!prev?.slugChanged;             // הערך הקודם האמיתי
    console.log("this.status", statusWas)
    console.log("this.slugChanged", alreadyChanged)
    if (statusWas !== "draft" || alreadyChanged) {
        return next(new Error("Slug can be changed only once while in draft"));
    }

    this.slugChanged = true;   // מסמן את השינוי הראשון
    next();
});




export const Store = mongoose.model("Store", storeSchema);
