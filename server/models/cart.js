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
  }, // חדש
  snapshot: {
    attributes: { type: Map, of: String }, // צבע, מידה וכו'
    images: [String], // רק התמונות של הווריאציה בזמן ההוספה
    price: Number,    // המחיר בזמן ההוספה (לחשבונית יציבה)
    discount: { type: Object }, // אם צריך לשמר הנחה ספציפית
  },
  selected: {
    type: Boolean,
    default: false
  } // חדש: נבחר לתשלום או לא

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
