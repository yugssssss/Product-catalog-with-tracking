const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { ok, fail } = require('../utils/response');

const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// ── POST /auth/register ───────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (await User.findOne({ email })) return fail(res, 409, 'Email already registered.');

    const user   = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    const tokens = generateTokenPair({ id: user._id, role: user.role });

    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: tokens.refreshToken } });

    return ok(res, 201, 'Registered successfully', { user: safeUser(user), ...tokens });
  } catch (err) { next(err); }
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password)))
      return fail(res, 401, 'Invalid email or password.');

    const tokens      = generateTokenPair({ id: user._id, role: user.role });
    const updatedToks = [...(user.refreshTokens || []), tokens.refreshToken].slice(-5);
    await User.findByIdAndUpdate(user._id, { refreshTokens: updatedToks });

    return ok(res, 200, 'Login successful', { user: safeUser(user), ...tokens });
  } catch (err) { next(err); }
};

// ── POST /auth/refresh ────────────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body; 
    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); }
    catch { return fail(res, 401, 'Invalid or expired refresh token.'); }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user?.refreshTokens?.includes(refreshToken))
      return fail(res, 401, 'Refresh token not recognised. Please log in again.');

    const tokens = generateTokenPair({ id: user._id, role: user.role });
    const rotated = user.refreshTokens.filter((t) => t !== refreshToken);
    rotated.push(tokens.refreshToken);
    await User.findByIdAndUpdate(user._id, { refreshTokens: rotated.slice(-5) });

    return ok(res, 200, 'Token refreshed', tokens);
  } catch (err) { next(err); }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken)
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
    return ok(res, 200, 'Logged out successfully');
  } catch (err) { next(err); }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
exports.getMe = (req, res) => ok(res, 200, 'Profile retrieved', req.user);
