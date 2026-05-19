const express = require('express');
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate, bookingSchema } = require('../middleware/validate');

const router = express.Router();

router.post('/', requireAuth, validate(bookingSchema), bookingController.createBooking);
router.get('/', requireAuth, bookingController.getBookings);

module.exports = router;
