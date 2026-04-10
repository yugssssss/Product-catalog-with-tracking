const Product = require('../models/Product');
const { ok, fail } = require('../utils/response');
const cache = require('../utils/cache');

const cacheKey = (q) => {
  const { page = 1, limit = 10, search = '', category = '', minPrice = '', maxPrice = '', sort = '' } = q;
  return `products:${page}:${limit}:${search}:${category}:${minPrice}:${maxPrice}:${sort}`;
};

// ── GET /products ──────────────────────────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const key    = cacheKey(req.query);
    const cached = await cache.get(key);
    if (cached) return res.status(200).json({ ...cached, cached: true });

    const { page = 1, limit = 10, search, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;

    const p   = Math.max(1, parseInt(page));
    const lim = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = { isActive: true };
    if (search)   filter.$or = [{ name: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }];
    if (category) filter.category = category.toLowerCase();
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    const VALID_SORTS = ['price', '-price', 'name', '-name', 'createdAt', '-createdAt', 'stock', '-stock'];
    const sortField   = VALID_SORTS.includes(sort) ? sort : '-createdAt';

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortField).skip((p - 1) * lim).limit(lim).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / lim);
    const payload = {
      success: true,
      message: 'Products retrieved',
      data: products,
      meta: { total, page: p, limit: lim, totalPages, hasNextPage: p < totalPages, hasPrevPage: p > 1 },
    };

    await cache.set(key, payload);
    return res.status(200).json(payload);
  } catch (err) { next(err); }
};

// ── GET /products/:id ─────────────────────────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return fail(res, 404, 'Product not found.');
    return ok(res, 200, 'Product retrieved', product);
  } catch (err) { next(err); }
};

// ── POST /products ────────────────────────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await cache.delPattern('products:*');
    return ok(res, 201, 'Product created', product);
  } catch (err) { next(err); }
};

// ── PUT /products/:id ─────────────────────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return fail(res, 404, 'Product not found.');
    await cache.delPattern('products:*');
    return ok(res, 200, 'Product updated', product);
  } catch (err) { next(err); }
};

// ── DELETE /products/:id ──────────────────────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!product) return fail(res, 404, 'Product not found.');
    await cache.delPattern('products:*');
    return ok(res, 200, 'Product deleted');
  } catch (err) { next(err); }
};
