import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variationId: {
      type: String, // שמירה על תאימות למה שיש במיין
      default: null,
      required: false, // לא כל מוצר חייב וריאציות
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: {
      // המחיר שבו הפריט נמצא כרגע בעגלה (יכול להיות שונה ממחיר המוצר בעתיד)
      type: Number,
      required: true,
      min: 0,
    },
    snapshot: {
      attributes: { type: Map, of: String }, // צבע, מידה וכו'
      images: [String], // רק התמונות של הווריאציה בזמן ההוספה
      price: Number,    // המחיר בזמן ההוספה (לחשבונית יציבה)
      discount: { type: Object }, // אם צריך לשמר הנחה ספציפית
    },
    // 🔹 שיווק שותפים – מי הביא את המוצר הזה לעגלה
    affiliateUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',      // אותו ref כמו בשדה userId הראשי
      default: null,
    },
    // ערך גולמי שהגיע מהפרונט (?ref=...), אם תרצי לוגים/דיבוג
    affiliateRefRaw: {
      type: String,
      default: null,
    },
    selected: {
      type: Boolean,
      default: true, // כל מוצר חדש נבחר אוטומטית לתשלום
    },
  },
  {
    _id: true, // נותן _id לכל פריט בעגלה → זה CartItem.id בצד לקוח
    id: false,
  }
);

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // עגלה אחת לכל משתמש
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// אינדקס לגישה מהירה לפי userId
CartSchema.index({ userId: 1 });

export const Cart = model("Cart", CartSchema);
