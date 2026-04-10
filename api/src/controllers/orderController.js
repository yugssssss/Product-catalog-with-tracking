const Order   = require('../models/Order');
const Product = require('../models/Product');
const { ok, fail } = require('../utils/response');

// ── POST /orders ──────────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    const orderItems = [];
    let totalAmount  = 0;

    for (const { productId, quantity } of items) {
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product)           return fail(res, 404, `Product not found: ${productId}`);
      if (product.stock < quantity)
        return fail(res, 409,
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`);

      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity });
      totalAmount += product.price * quantity;
    }

    // Deduct stock atomically per product
    await Promise.all(
      items.map(({ productId, quantity }) =>
        Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } })
      )
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id }],
    });

    return ok(res, 201, 'Order placed successfully', order);
  } catch (err) { next(err); }
};

// ── GET /orders ───────────────────────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const p   = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = {};
    if (req.user.role !== 'admin') filter.user = req.user._id; // users see only their own
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip((p - 1) * lim)
        .limit(lim),
      Order.countDocuments(filter),
    ]);

    return ok(res, 200, 'Orders retrieved', orders, {
      total, page: p, limit: lim, totalPages: Math.ceil(total / lim),
    });
  } catch (err) { next(err); }
};

// ── GET /orders/:id ───────────────────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) return fail(res, 404, 'Order not found.');

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner)
      return fail(res, 403, 'Access denied. This is not your order.');

    return ok(res, 200, 'Order retrieved', order);
  } catch (err) { next(err); }
};

// ── PATCH /orders/:id/status  (admin only) ───────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const VALID = ['pending', 'confirmed', 'shipped', 'delivered'];
    const { status } = req.body;
    if (!VALID.includes(status)) return fail(res, 400, `Status must be one of: ${VALID.join(', ')}`);

    const order = await Order.findById(req.params.id).populate('user', '_id name email');
    if (!order) return fail(res, 404, 'Order not found.');

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id });
    await order.save();

    // ── Real-time: emit to the order owner's private room ─────────────────────
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.user._id}`).emit('order:statusUpdated', {
        orderId:        order._id,
        previousStatus: prevStatus,
        newStatus:      status,
        updatedAt:      new Date(),
        message:        `Your order #${order._id} is now ${status}.`,
      });
    }

    return ok(res, 200, 'Order status updated', order);
  } catch (err) { next(err); }
};
