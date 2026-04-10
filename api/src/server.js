require('dotenv').config();

const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const morgan   = require('morgan');

const connectDB            = require('./config/database');
const { connectRedis }     = require('./config/redis');
const { initSocket }       = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const authRoutes    = require('./routes/authRoutes');
const orderRoutes   = require('./routes/orderRoutes');

// ─── App & HTTP server ────────────────────────────────────────────────────────
const app        = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});
app.set('io', io);   // make io accessible in controllers via req.app.get('io')
initSocket(io);

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,     authRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/orders`,   orderRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀  API   →  http://localhost:${PORT}${API}`);
    console.log(`📡  WS    →  ws://localhost:${PORT}`);
    console.log(`❤️   Health →  http://localhost:${PORT}/health\n`);
  });
})();

module.exports = { app, httpServer };
