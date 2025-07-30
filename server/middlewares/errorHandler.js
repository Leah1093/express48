export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = errMessageForClient(statusCode);

  console.error(`❌ Error [${statusCode}]: ${err.message}`);

  res.status(statusCode).json({
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

function errMessageForClient(statusCode) {
  switch (statusCode) {
    case 400: return 'Invalid request parameters';
    case 401: return 'Authorization required';
    case 404: return 'Not found';
    case 407: return 'Authorization failed';
    case 409: return 'An existing element already exists';
    case 500: return 'Internal Server Error';
    default:  return 'Something went wrong!';
  }
}
