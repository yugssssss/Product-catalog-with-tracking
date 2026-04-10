const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET  || 'access_secret';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'refresh_secret';

const generateTokenPair = (payload) => ({
  accessToken:  jwt.sign(payload, ACCESS_SECRET(),  { expiresIn: process.env.JWT_ACCESS_EXPIRES  || '15m' }),
  refreshToken: jwt.sign(payload, REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'  }),
});

const verifyAccessToken  = (t) => jwt.verify(t, ACCESS_SECRET());
const verifyRefreshToken = (t) => jwt.verify(t, REFRESH_SECRET());

module.exports = { generateTokenPair, verifyAccessToken, verifyRefreshToken };
