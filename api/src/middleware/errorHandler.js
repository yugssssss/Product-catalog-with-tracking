const { fail } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let status  = err.statusCode || 500;
  let message = err.message   || 'Internal server error';

  if (err.name === 'ValidationError') {
    status  = 422;
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return fail(res, status, 'Validation failed', errors);
  }

  if (err.code === 11000) {
    status  = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}: ${err.value}`; }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token.'; }

  if (process.env.NODE_ENV === 'development') console.error(err);

  return fail(res, status, message);
};

const notFound = (req, res) => fail(res, 404, `Route ${req.originalUrl} not found.`);

module.exports = { errorHandler, notFound };
