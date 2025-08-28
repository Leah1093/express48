// server/ai/normalizeProduct.js
import OpenAI from "openai";
import Ajv from "ajv";

// חיבור ל-OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// סכימה אחידה של מוצר
export const productSchema = {
  $id: "https://express48.co.il/schemas/product.json",
  type: "object",
  additionalProperties: false,
  required: ["title", "category", "brand", "specs"],
  properties: {
    id: { type: ["string", "null"] },
    title: { type: "string", minLength: 2 },
    description: { type: ["string", "null"] },
    category: { type: "string", enum: ["טלפונים", "מחשבים", "טלוויזיות", "אודיו", "אביזרים", "אחר"] },
    brand: { type: ["string", "null"] },
    model: { type: ["string", "null"] },
    gtin: { type: ["string", "null"] },
    price: { type: ["number", "null"] },
    currency: { type: "string", enum: ["ILS", "USD", "EUR"], default: "ILS" },
    images: { type: "array", items: { type: "string", format: "uri" }, default: [] },
    specs: { type: "object", additionalProperties: { type: ["string", "number", "boolean", "null"] } },
    // שדות מטה
    _confidence: { type: "object", additionalProperties: { type: "number", minimum: 0, maximum: 1 }, default: {} },
    _sources: { type: "object", additionalProperties: { type: "string" }, default: {} }
  }
};

// AJV לולידציה
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(productSchema);

// פונקציית Normalize
// export async function normalizeWithAI(partialProduct) {
//   const system = `
// את/ה ממיין/ת נתוני מוצר וממלא/ת רק שדות חסרים לפי הסכימה.
// כל מה שלא מופיע במידע שסופק - השאר null וכתבו confidence=0.
// אל תמציא/י נתונים, ואל תשנה/י ערכים קיימים.
// `;

//   const response = await openai.responses.create({
//     model: "gpt-4o-mini", // אפשר גם gpt-5, אבל זה זול ומהיר יותר
//     input: [
//       { role: "system", content: system },
//       { role: "user", content: `סכימה: ${JSON.stringify(productSchema)}` },
//       { role: "user", content: `מוצר חלקי מהספק: ${JSON.stringify(partialProduct)}` }
//     ],
//     response_format: {
//       type: "json_schema",
//       json_schema: {
//         name: "Product",
//         schema: productSchema,
//         strict: true
//       }
//     },
//     temperature: 0
//   });

//   // הפלט של המודל
//   const normalized = JSON.parse(response.output_text);

//   // ולידציה נוספת
//   if (!validate(normalized)) {
//     throw new Error("Invalid product JSON: " + ajv.errorsText(validate.errors));
//   }

//   // מיזוג: נותן עדיפות לשדות שהגיעו מהספק
//   return {
//     ...normalized,
//     ...partialProduct,
//     specs: { ...(normalized.specs || {}), ...(partialProduct.specs || {}) }
//   };
// }


// mock/openaiMock.js
export async function mockNormalizeWithAI(partialProduct) {
  // נניח שהמודל "מילא" רק את מה שחסר
  const normalized = {
    id: partialProduct.id || "mock-id-123",
    title: partialProduct.title || "מוצר לדוגמה",
    description: partialProduct.description || null,
    category: partialProduct.category || "אחר",
    brand: partialProduct.brand || null,
    model: partialProduct.model || null,
    gtin: partialProduct.gtin || null,
    price: partialProduct.price || null,
    specs: {
      color: "black",
      size: "M",
      ...(partialProduct.specs || {}),
    },
  };

  // מחזירים כאילו זה מה-AI
  return {
    ...normalized,
    ...partialProduct, // עדיפות לנתוני ספק
    specs: { ...(normalized.specs || {}), ...(partialProduct.specs || {}) },
  };
}
