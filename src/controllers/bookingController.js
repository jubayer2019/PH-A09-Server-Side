const asyncHandler = require('../utils/asyncHandler');
const bookingService = require('../services/bookingService');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    userId: req.user.id,
    carId: req.body.carId,
    bookingDate: req.body.bookingDate,
    driverNeeded: req.body.driverNeeded,
    specialNote: req.body.specialNote,
  });

  res.status(201).json({ success: true, data: booking });
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookingsByUser(req.user.id);
  res.status(200).json({ success: true, data: bookings });
});

module.exports = {
  createBooking,
  getBookings,
};
