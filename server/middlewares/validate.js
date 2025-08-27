export const validate = (schema, property = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[property]);
    console.log("validat mar")

    // מכניסים חזרה למקום הנכון
    if (property === "body")   req.body   = parsed;
    if (property === "params") req.params = parsed;
    if (property === "query")  req.query  = parsed;

    // אופציונלי: לשימוש בקונטרולר
    req.validated = req.validated || {};
    req.validated[property] = parsed;

    next();
  } catch (err) {
        console.log("validat mar")

    return res.status(400).json({
      success: false,
      message: err.errors?.[0]?.message || "שגיאת ולידציה",
      errors: err.errors, // עוזר לדבג
    });
  }
};

// לבדוק אם יותר טוב
// // middlewares/validate.js
// import { ZodError } from "zod";

// const ALLOWED = new Set(["body", "query", "params"]);

// export const validate = (schema, property = "body") => {
//   if (!ALLOWED.has(property)) {
//     throw new Error(`validate(): invalid property "${property}"`);
//   }

//   return async (req, res, next) => {
//     try {
//       const target = req[property] ?? {};
//       // תומך גם ב-refine/transform אסינכרוניים
//       const parsed = await schema.safeParseAsync(target);

//       if (!parsed.success) {
//         return res.status(400).json({
//           ok: false,
//           error: "שגיאת ולידציה",
//           details: parsed.error.issues.map((i) => ({
//             path: i.path.join("."),
//             message: i.message,
//             code: i.code,
//           })),
//         });
//       }

//       // מכניסים חזרה למקום הנכון (כולל coercion ו-defaults)
//       req[property] = parsed.data;

//       // אופציונלי: שמירה גם ב-namespaced
//       req.validated = req.validated || {};
//       req.validated[property] = parsed.data;

//       next();
//     } catch (err) {
//       if (err instanceof ZodError) {
//         return res.status(400).json({
//           ok: false,
//           error: "שגיאת ולידציה",
//           details: err.issues.map((i) => ({
//             path: i.path.join("."),
//             message: i.message,
//             code: i.code,
//           })),
//         });
//       }
//       next(err); // שגיאה לא־ולידטיבית – תטופל ע״י error handler כללי
//     }
//   };
// };
