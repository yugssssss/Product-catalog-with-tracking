const { verifyAccessToken } = require('../utils/jwt');
const { fail } = require('../utils/response');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return fail(res, 401, 'No token provided.');

    const decoded = verifyAccessToken(header.split(' ')[1]);
    const user = await User.findById(decoded.id).select('_id name email role');
    if (!user) return fail(res, 401, 'User no longer exists.');

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Access token expired.' : 'Invalid token.';
    return fail(res, 401, msg);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return fail(res, 403, `Access denied. Required role: ${roles.join(' or ')}.`);
  next();
};

module.exports = { authenticate, authorize };
