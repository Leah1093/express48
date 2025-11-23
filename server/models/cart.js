// import mongoose from 'mongoose';

// const cartItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   variationId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: false, // לא כל מוצר חייב וריאציות
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1,
//     default: 1
//   },
//   unitPrice: {
//     type: Number,
//     required: true
//   }, // חדש
//   snapshot: {
//     attributes: { type: Map, of: String }, // צבע, מידה וכו'
//     images: [String], // רק התמונות של הווריאציה בזמן ההוספה
//     price: Number,    // המחיר בזמן ההוספה (לחשבונית יציבה)
//     discount: { type: Object }, // אם צריך לשמר הנחה ספציפית
//   },
//   selected: {
//     type: Boolean,
//     default: false
//   } // חדש: נבחר לתשלום או לא

// });

// const cartSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   items: [cartItemSchema]
// });

// export const Cart = mongoose.model('Cart', cartSchema);



import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      // המחיר שבו הפריט נמצא כרגע בעגלה (יכול להיות שונה ממחיר המוצר בעתיד)
      type: Number,
      required: true,
      min: 0,
    },
    selected: {
      type: Boolean,
      default: true,
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
