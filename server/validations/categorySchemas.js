import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z.string().min(2, "שם קטגוריה קצר מדי"),
    parentId: z.string().optional().nullable(),
    // icon: z.string().url("כתובת תמונה לא תקינה").optional().nullable(),
    icon: z.union([z.string().url().optional().nullable(), z.any().optional().nullable()]),
  })
  .refine(
    (data) => {
      // אם זו קטגוריה ראשית (אין parentId) → חייבת אייקון
      if (!data.parentId) {
        return !!data.icon;
      }
         // תת־קטגוריה → אסור אייקון
      if (data.parentId) {
        return !data.icon;
      }
      // אם זו תת קטגוריה → מותר גם בלי אייקון
      return true;
    },
    {
      message: "לכל קטגוריה ראשית חייבת להיות תמונה",
      path: ["icon"], // השגיאה תופיע על השדה "icon"
    }
  );

export const updateCategorySchema = createCategorySchema.partial();
