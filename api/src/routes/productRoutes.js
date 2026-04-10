const router = require('express').Router();
const { body, query } = require('express-validator');
const ctrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const productBody = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be ≥ 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be ≥ 0'),
  body('description').optional().isLength({ max: 2000 }),
  body('images').optional().isArray(),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
];

// Public
router.get('/',    listQuery, validate, ctrl.getProducts);
router.get('/:id', ctrl.getProduct);

// Admin only
router.post(  '/',    authenticate, authorize('admin'), productBody, validate, ctrl.createProduct);
router.put(   '/:id', authenticate, authorize('admin'), productBody, validate, ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteProduct);

module.exports = router;
