const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate, authRegisterSchema, authLoginSchema } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validate(authRegisterSchema), authController.register);
router.post('/login', validate(authLoginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, authController.me);

module.exports = router;
