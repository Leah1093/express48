//וריאציות 
// משקל גודל







// ---------- Subschemas ----------
const DiscountSchema = new mongoose.Schema({
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    startsAt: { type: Date },   // 🆕 מתי ההנחה מתחילה
    expiresAt: { type: Date },
}, { _id: false });

DiscountSchema.path("discountValue").validate(function (v) {
    if (this.discountType === "percent") return v >= 0 && v <= 100; // ▶ אחוז 0-100
    return v >= 0; // ▶ fixed לא שלילי
}, "Invalid discountValue for discountType");

const PriceSchema = new mongoose.Schema({
    amount: { type: Number, required: true, min: 0 }, // ▶ סכום במטבע המוצר
}, { _id: false });



//מידות משקל הערה


const variationSchema = new mongoose.Schema({
    sku: { type: String },                  // מזהה ייחודי לוריאציה
    attributes: {                           // מאפייני הווריאציה (צבע, מידה וכו')
        color: { type: String },              // צבע
        size: { type: String },               // מידה
        storage: { type: String },            // אחסון (לדוגמה 128GB)
    },
    // ▶ מחיר וריאציה אופציונלי, ללא currency. אם אין - נופלים למחיר המוצר
    price: { type: PriceSchema, required: false },
    // ▶ הנחת וריאציה אופציונלית. אם פעילה - גוברת על הנחת מוצר
    discount: { type: DiscountSchema, required: false },
    stock: { type: Number, default: 0 },    // מלאי לוריאציה
    images: { type: [String], default: [] } // תמונות ספציפיות לוריאציה
});

const productSchema = new mongoose.Schema({
    // זיהוי לפי ספק/מוכר/חנות
    supplier: { type: String, index: true },   //  ספק
    sellerId: { type: String, index: true },   // מזהה מוכר
    storeId: { type: String, index: true },   // מזהה חנות

    // SEO
    slug: { type: String, minlength: 3, maxlength: 100, index: true }, // כתובת URL ידידותית
    metaTitle: { type: String, default: "" }, // כותרת קצרה לגוגל
    metaDescription: { type: String, default: "" }, // תיאור קצר לגוגל

    // מידע כללי
    title: { type: String, required: true },      // שם מוצר בעברית להצגה
    titleEn: { type: String, default: "" },         // שם מוצר באנגלית (ל־slug ו־SEO)
    description: { type: String, default: "" },     // תיאור מלא

    overview: {                                     // סקירה כללית
        text: { type: String, default: "" },        // טקסט סקירה
        images: { type: [String], default: [] },      // תמונות סקירה
        videos: { type: [String], default: [] },      // סרטוני סקירה
    },

    gtin: { type: String, default: "" },           // ברקוד (EAN/UPC/ISBN)
    sku: { type: String, index: true },           // SKU פנימי
    model: { type: String, default: "" },           // דגם יצרן

    // מטבע
    currency: { type: String, default: "ILS" },

    // מחיר
    price: { type: PriceSchema, required: true },

    // הנחה
    discount: { type: DiscountSchema, required: false },

    // וריאציות
    variations: [variationSchema],                  // מערך וריאציות

    // מלאי
    stock: { type: Number, default: 0 },          // מלאי כללי
    inStock: { type: Boolean, default: false },     // האם יש מלאי (נגזר אוטומטית)

    // מדדים
    views: { type: Number, default: 0 },        // כמה פעמים צפו במוצר
    purchases: { type: Number, default: 0 },        // כמה פעמים נרכש

    // מפרט טכני
    specs: { type: Map, of: String, default: {} },  // מפת מאפיינים גמישה

    // מדיה
    images: { type: [String], default: [] },        // תמונות מוצר
    video: { type: String, default: "" },          // סרטון מוצר

    // דירוג
    ratings: {
        sum: { type: Number, default: 0 },          // סה״כ כוכבים
        avg: { type: Number, default: 0 },          // ממוצע דירוג
        count: { type: Number, default: 0 },          // מספר מדרגים
        breakdown: {                                  // פיזור דירוגים 1–5
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 },
        }
    },

    // סטטוס פנימי
    status: { type: String, enum: ["טיוטא", "מפורסם", "מושהה"], default: "טיוטא" }, // מצב מוצר

    // נראות ותזמון הצגה באתר
    visibility: { type: String, enum: ["public", "private", "restricted"], default: "public" }, // מי רואה את המוצר
    scheduledAt: { type: Date },  // מועד התחלת הצגה
    visibleUntil: { type: Date },  // מועד סיום הצגה (null = ללא מגבלה)


    // אחריות
    warranty: { type: String, default: "12 חודשים אחריות יבואן רשמי" }, // אחריות

    // שילוח והובלה
    shipping: {
        dimensions: {
            length: { type: Number, default: 0 }, // ס"מ
            width: { type: Number, default: 0 }, // ס"מ
            height: { type: Number, default: 0 }, // ס"מ
        },
        weightKg: { type: Number, default: 0, min: 0 }, //משקל ק"ג
        from: { type: String, default: "IL" }, // מדינת מקור
    },
    delivery: {
        requiresDelivery: { type: Boolean, default: false }, // האם דורש הובלה מיוחדת
        cost: { type: Number, default: 0 },      // מחיר ההובלה
        notes: { type: String, default: "" },     // הערות (כמו "כולל התקנה")
    }
})