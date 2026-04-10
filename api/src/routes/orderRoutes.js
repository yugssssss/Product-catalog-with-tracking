const router = require('express').Router();
const { body, query } = require('express-validator');
const ctrl = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All order routes require auth
router.use(authenticate);

router.post('/',
  [
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.productId').notEmpty().withMessage('productId is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be ≥ 1'),
  ],
  validate, ctrl.createOrder
);

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered']),
  ],
  validate, ctrl.getOrders
);

router.get('/:id', ctrl.getOrder);

router.patch('/:id/status',
  authorize('admin'),
  [body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered']).withMessage('Invalid status')],
  validate, ctrl.updateOrderStatus
);

module.exports = router;
