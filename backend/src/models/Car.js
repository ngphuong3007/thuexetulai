const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    plate: { type: String, required: true, unique: true },
    pricePerDay: { type: Number, required: true },
    available: { type: Boolean, default: true },
    images: [String],
    location: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', CarSchema);
