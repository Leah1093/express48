import { CustomError } from "../utils/CustomError.js";

export const validate = (schema, property = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[property]);

    // מכניסים חזרה למקום הנכון
    if (property === "body")   req.body   = parsed;
    if (property === "params") req.params = parsed;
    if (property === "query")  req.query  = parsed;

    // אופציונלי: לשימוש בקונטרולר
    req.validated = req.validated || {};
    req.validated[property] = parsed;

    next();
  } catch (err) {
    // כאן במקום להחזיר JSON → נזרוק CustomError
    const message = err.errors?.[0]?.message || "שגיאת ולידציה";
    next(new CustomError(message, 400));
  }
};
