import { z } from "zod";

/** -------- Bool פרמטרי URL לוגיים (true/false, "true"/"false", 1/0, "1"/"0") -------- */
export const boolParam = z
  .union([
    z.boolean(),
    z.literal("true"),
    z.literal("false"),
    z.literal("1"),
    z.literal("0"),
    z.number().int().min(0).max(1),
  ])
  .transform((v) => v === true || v === "true" || v === 1 || v === "1");

/** -------- ObjectId תקינות מזהה מונגו -------- */
export const objectIdParam = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ObjectId לא תקין");

/** -------- תאריך ISO כ־Date (למשל from/to מה־query) -------- */
export const dateParam = z
  .string()
  .datetime() // ISO 8601
  .transform((v) => new Date(v));

/** -------- מספר שלם עם coercion (מתאים ל-page/limit/stars) -------- */
export const intParam = (opts = {}) =>
  z.coerce.number().int()
    .pipe(opts.min !== undefined ? z.number().min(opts.min) : z.number())
    .pipe(opts.max !== undefined ? z.number().max(opts.max) : z.number());

/** -------- פגינציה סטנדרטית (page, limit) עם ברירות מחדל -------- */
export const paginationParams = z.object({
  page: intParam({ min: 1 }).default(1),
  limit: intParam({ min: 1, max: 50 }).default(10),
});

/** -------- מחרוזת אופציונלית עם trim; ריקה => undefined -------- */
export const trimmedOptionalString = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length >= 0, { message: "שדה לא תקין" })
  .transform((s) => (s === "" ? undefined : s));

/** -------- מערך ObjectId-ים מתוך CSV (למשל ids=...,... ב-query) -------- */
export const objectIdCsvParam = z
  .string()
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
  .refine(
    (arr) => arr.every((id) => /^[0-9a-fA-F]{24}$/.test(id)),
    { message: "אחד המזהים אינו ObjectId תקין" }
  );

/** -------- בדיקת טווח תאריכים (from <= to) אחרי parsing -------- */
export const dateRange = z.object({
  from: dateParam.optional(),
  to: dateParam.optional(),
}).refine(
  (v) => !(v.from && v.to) || v.from <= v.to,
  { message: "טווח תאריכים לא תקין: from צריך להיות קטן או שווה ל-to" }
);

/** -------- enum עזר למיון (מחרוזות מותרות בלבד) -------- */
export const sortEnum = (values) => z.enum(values);

/** -------- עזר קטן: nullable -> undefined -------- */
export const nullableToUndefined = (schema) =>
  z.preprocess((v) => (v === null ? undefined : v), schema);
