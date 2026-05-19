const { z } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(message, 400));
  }

  req.body = result.data;
  return next();
};

const authRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  photo: z.string().url().optional().or(z.literal('')),
});

const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const carSchema = z.object({
  carName: z.string().min(2),
  dailyRentPrice: z.coerce.number().min(0),
  carType: z.string().min(2),
  image: z.string().url(),
  seatCapacity: z.coerce.number().min(1),
  pickupLocation: z.string().min(2),
  description: z.string().min(20),
  availability: z.boolean(),
});

const carUpdateSchema = carSchema.partial();

const bookingSchema = z.object({
  carId: z.string().min(1),
  bookingDate: z.coerce.date(),
  driverNeeded: z.boolean().default(false),
  specialNote: z.string().max(200).optional().default(''),
});

module.exports = {
  validate,
  authRegisterSchema,
  authLoginSchema,
  carSchema,
  carUpdateSchema,
  bookingSchema,
};
