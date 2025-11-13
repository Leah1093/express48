import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // שם הקטגוריה
    name: { type: String, required: true, trim: true },

    // כתובת slug (ייחודית בתוך אותו parent)
    slug: { type: String, required: true, trim: true },

    // מזהה של קטגוריית האב (null אם זו קטגוריית שורש)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // slug מלא (למשל: electronics/computers-mobile/tablets)
    fullSlug: { type: String, required: true, trim: true },

    // מערך של כל ה־slugs בדרך (לשליפה מהירה)
    pathSlugs: { type: [String], default: [] },

    // מערך מזהים של כל האבות
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // עומק היררכי (0 = שורש)
    depth: { type: Number, default: 0 },

    // האם הקטגוריה פעילה
    isActive: { type: Boolean, default: true },

    // סדר תצוגה
    order: { type: Number, default: 0 },

    // אייקון (למשל lucide:cpu)
    icon: { type: String, default: "" },

    // תמונה רלוונטית אם יש
    imageUrl: { type: String, default: "" },

    // תיאור (לא חובה)
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// אינדקסים חשובים
categorySchema.index({ parent: 1, slug: 1 }, { unique: true, name: "uniq_parent_slug" });
categorySchema.index({ fullSlug: 1 }, { name: "idx_fullSlug" });
categorySchema.index({ pathSlugs: 1 }, { name: "idx_pathSlugs" });
categorySchema.index({ isActive: 1, order: 1 }, { name: "idx_active_order" });

// מוודא שאין כפילויות בשם המודל (כשמריצים ב-HMR או Serverless)
export const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

  // ייצוא גם כברירת מחדל וגם בשם
export default CategoryModel;
export const Category = CategoryModel;

