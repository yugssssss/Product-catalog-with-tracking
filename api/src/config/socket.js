const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const initSocket = (io) => {
  // Auth middleware for every socket connection
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return next(new Error('AUTH_REQUIRED'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('_id name role');
      if (!user) return next(new Error('USER_NOT_FOUND'));

      socket.user = user;
      next();
    } catch {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const { _id, name, role } = socket.user;

    // Every user joins their private room  →  user:<id>
    socket.join(`user:${_id}`);
    if (role === 'admin') socket.join('admin');

    console.log(`🔌 [${role}] ${name} connected (${socket.id})`);

    socket.emit('connected', {
      message: `Hi ${name}! Listening for order updates…`,
      room: `user:${_id}`,
    });

    socket.on('disconnect', (reason) =>
      console.log(`🔌 [${role}] ${name} disconnected — ${reason}`)
    );
  });
};

module.exports = { initSocket };
