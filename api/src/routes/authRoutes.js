const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
  ],
  validate, ctrl.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate, ctrl.login
);

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('refreshToken required')],
  validate, ctrl.refresh
);

router.post('/logout', authenticate, ctrl.logout);
router.get('/me',      authenticate, ctrl.getMe);

module.exports = router;
