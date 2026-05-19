const asyncHandler = require('../utils/asyncHandler');
const carService = require('../services/carService');

const getCars = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 9);

  const result = await carService.getCars({
    page,
    limit,
    search: req.query.search,
    carType: req.query.carType,
    sortByPrice: req.query.sortByPrice,
  });

  res.status(200).json({
    success: true,
    data: result.cars,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

const getCarById = asyncHandler(async (req, res) => {
  const car = await carService.getCarById(req.params.id);
  res.status(200).json({ success: true, data: car });
});

const createCar = asyncHandler(async (req, res) => {
  const car = await carService.createCar({
    ...req.body,
    ownerId: req.user.id,
    ownerEmail: req.user.email,
  });

  res.status(201).json({ success: true, data: car });
});

const updateCar = asyncHandler(async (req, res) => {
  const car = await carService.updateCar(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: car });
});

const deleteCar = asyncHandler(async (req, res) => {
  await carService.deleteCar(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Car deleted successfully' });
});

const getMyCars = asyncHandler(async (req, res) => {
  const cars = await carService.getMyCars(req.user.id);
  res.status(200).json({ success: true, data: cars });
});

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getMyCars,
};
