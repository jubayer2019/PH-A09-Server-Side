const Booking = require('../models/Booking');
const Car = require('../models/Car');
const AppError = require('../utils/AppError');

const createBooking = async ({ userId, carId, bookingDate, driverNeeded, specialNote }) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError('Car not found', 404);

  const totalPrice = car.dailyRentPrice + (driverNeeded ? 45 : 0);

  const booking = await Booking.create({
    userId,
    carId,
    bookingDate,
    driverNeeded,
    specialNote,
    totalPrice,
    status: 'pending',
  });

  await Car.updateOne({ _id: carId }, { $inc: { bookingCount: 1 } });

  return booking;
};

const getBookingsByUser = async (userId) => {
  return Booking.find({ userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'carId', select: 'carName image dailyRentPrice carType pickupLocation' })
    .lean();
};

module.exports = {
  createBooking,
  getBookingsByUser,
};
