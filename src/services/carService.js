const Car = require('../models/Car');
const AppError = require('../utils/AppError');

const getCars = async ({ page, limit, search, carType, sortByPrice }) => {
  const query = {};

  if (search) {
    query.carName = { $regex: search, $options: 'i' };
  }

  if (carType) {
    query.carType = carType;
  }

  const sort = {};
  if (sortByPrice === 'asc') sort.dailyRentPrice = 1;
  if (sortByPrice === 'desc') sort.dailyRentPrice = -1;
  if (!sortByPrice) sort.createdAt = -1;

  const skip = (page - 1) * limit;

  const [cars, total] = await Promise.all([
    Car.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Car.countDocuments(query),
  ]);

  return { cars, total };
};

const getCarById = async (carId) => {
  const car = await Car.findById(carId).lean();
  if (!car) throw new AppError('Car not found', 404);
  return car;
};

const createCar = async (payload) => Car.create(payload);

const updateCar = async (carId, userId, payload) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError('Car not found', 404);
  if (car.ownerId.toString() !== userId) throw new AppError('Forbidden', 403);

  Object.assign(car, payload, { updatedAt: new Date() });
  await car.save();
  return car;
};

const deleteCar = async (carId, userId) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError('Car not found', 404);
  if (car.ownerId.toString() !== userId) throw new AppError('Forbidden', 403);

  await Car.deleteOne({ _id: carId });
};

const getMyCars = async (ownerId) => Car.find({ ownerId }).sort({ createdAt: -1 }).lean();

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getMyCars,
};
