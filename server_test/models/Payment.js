import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true, required: true },

    // מזהה המשתמש ששילם
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // נתחיל לא חובה, נהפוך לחובה אחרי מיגרציה

    transactionId: { type: String, index: true }, // יגיע מספק הסליקה
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ILS' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      default: 'pending',
      index: true
    },
    paymentUrl: { type: String },
    customerEmail: { type: String },

    // דיבוג ושחזור
    gatewayCreateResponse: { type: Object },
    gatewayNotifyPayload: { type: Object }
  },
  { timestamps: true }
);

// אינדקסים שימושיים לדוחות ולחיפושים
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, status: 1, createdAt: -1 });
// אם transactionId אמור להיות ייחודי אצלך - מומלץ להפוך אותו לייחודי
// שים לב: לפני הפעלת ייחודיות ודא שאין כפילויות קיימות במסד הנתונים
// paymentSchema.index({ transactionId: 1 }, { unique: true, partialFilterExpression: { transactionId: { $type: 'string' } } });

// אם אתה מאפשר כמה ניסיונות תשלום לאותה הזמנה, אל תעשה unique על orderId.
// אם בכל זאת יש כלל עסקי של "תשלום אחד מוצלח להזמנה", אפשר אינדקס חלקי:
paymentSchema.index(
  { orderId: 1 },
  { partialFilterExpression: { status: 'paid' } }
);

export const Payment = mongoose.model('Payment', paymentSchema);
