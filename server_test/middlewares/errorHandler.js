export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.status || err.statusCode ||
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
    case 400: return "Invalid request parameters";
    case 401: return "Authorization required";
    case 404: return "Not found";
    case 407: return "Authorization failed";
    case 409: return "An existing element already exists";
    case 500: return "Internal Server Error";
    default:  return "Something went wrong!";
  }
}
