const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    plate: { type: String, required: true, unique: true },
    pricePerDay: { type: Number, required: true },
    available: { type: Boolean, default: true },
    images: [String],
    location: { type: String },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', CarSchema);
