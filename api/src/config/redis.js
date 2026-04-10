const Redis = require('ioredis');

let client = null;

const connectRedis = () => {
  client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: (times) => (times > 3 ? null : times * 300),
  });

  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') console.error('Redis error:', err.message);
  });

  client.connect().catch(() => console.warn('⚠️  Redis unavailable — caching disabled'));
};

const getClient = () => client;
const isReady = () => client?.status === 'ready';

module.exports = { connectRedis, getClient, isReady };
