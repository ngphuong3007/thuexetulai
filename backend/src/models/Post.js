const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postType: {
      type: String,
      enum: ['rent_request', 'car_offer'],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    location: { type: String, required: true },
    contactPhone: { type: String },
    budgetPerDay: { type: Number },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
