import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // לא כל מוצר חייב וריאציות
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  }, // מחיר ליחידה בזמן ההוספה
  snapshot: {
    attributes: { type: Map, of: String }, // צבע, מידה וכו'
    images: [String], // רק התמונות של הווריאציה בזמן ההוספה
    price: Number,    // המחיר בזמן ההוספה (לחשבונית יציבה)
    discount: { type: Object }, // אם צריך לשמר הנחה ספציפית
  },

  // 🔹 שיווק שותפים – מי הביא את המוצר הזה לעגלה
  affiliateUser: {
    type: mongoose.Schema.Types.ObjectId,
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
    default: true  // כל מוצר חדש נבחר אוטומטית לתשלום
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
});

export const Cart = mongoose.model('Cart', cartSchema);
