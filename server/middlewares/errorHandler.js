import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  // 💾 קודם כל: טיפול בשגיאות של Multer (העלאת קבצים)
  if (err instanceof multer.MulterError) {
    let message = err.message;
    let statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "הקובץ גדול מדי. הגודל המקסימלי הוא 10MB";
    }

    console.error("❌ Multer Error:", {
      code: err.code,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(statusCode).json({
      status: statusCode,
      error: message,
      code: err.code,
    });
  }

  // שאר השגיאות - לוגיקה רגילה
  const statusCode =
    err.status ||
    err.statusCode ||
    (res.statusCode !== 200 ? res.statusCode : 500);

  const message = err.message || errMessageForClient(statusCode);

  console.error("❌ Error Handler Log:", {
    status: statusCode,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    status: statusCode,
    error: message,
  });
};

function errMessageForClient(statusCode) {
  switch (statusCode) {
    case 400:
      return "Invalid request parameters";
    case 401:
      return "Authorization required";
    case 404:
      return "Not found";
    case 407:
      return "Authorization failed";
    case 409:
      return "An existing element already exists";
    case 500:
      return "Internal Server Error";
    default:
      return "Something went wrong!";
  }
}
