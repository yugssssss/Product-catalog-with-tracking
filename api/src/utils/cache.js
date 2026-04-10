const { getClient, isReady } = require('../config/redis');
const TTL = () => parseInt(process.env.REDIS_TTL) || 60;

const get = async (key) => {
  if (!isReady()) return null;
  try {
    const raw = await getClient().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const set = async (key, value, ttl = TTL()) => {
  if (!isReady()) return;
  try { await getClient().set(key, JSON.stringify(value), 'EX', ttl); } catch { /* noop */ }
};

const delPattern = async (pattern) => {
  if (!isReady()) return;
  try {
    const keys = await getClient().keys(pattern);
    if (keys.length) await getClient().del(...keys);
  } catch { /* noop */ }
};

module.exports = { get, set, delPattern };
