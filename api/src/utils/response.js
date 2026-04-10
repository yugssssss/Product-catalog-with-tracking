const ok = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const fail = (res, statusCode, message, errors = null) => {
  const body = {
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { ok, fail };
