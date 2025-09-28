import { z } from "zod";

const baseCategorySchema = z.object({
  name: z.string().min(2, "שם קטגוריה קצר מדי"),
  parentId: z.string().optional().nullable(),
  icon: z.union([
    z.string().url().optional().nullable(),
    z.any().optional().nullable(),
  ]),
});

export const createCategorySchema = baseCategorySchema.refine(
  (data) => {
    if (!data.parentId) {
      return !!data.icon; // קטגוריה ראשית → חייב אייקון
    }
    if (data.parentId) {
      return !data.icon; // תת קטגוריה → אסור אייקון
    }
    return true;
  },
  {
    message: "לכל קטגוריה ראשית חייבת להיות תמונה",
    path: ["icon"],
  }
);

// כאן צריך לקחת את ה-object עצמו (לפני refine) ואז לעשות partial
export const updateCategorySchema = baseCategorySchema.partial();
