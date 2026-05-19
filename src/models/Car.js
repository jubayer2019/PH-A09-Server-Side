const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    carName: { type: String, required: true, trim: true },
    dailyRentPrice: { type: Number, required: true, min: 0 },
    carType: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    seatCapacity: { type: Number, required: true, min: 1 },
    pickupLocation: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    availability: { type: Boolean, default: true },
    bookingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, versionKey: false }
);

module.exports = mongoose.model('Car', carSchema);
