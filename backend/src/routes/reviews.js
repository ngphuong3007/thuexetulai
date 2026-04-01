const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const auth = require('../middleware/auth');
const Car = require('../models/Car');
const Review = require('../models/Review');

async function refreshCarRating(carId) {
  const result = await Review.aggregate([
    { $match: { car: new mongoose.Types.ObjectId(carId) } },
    {
      $group: {
        _id: '$car',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    await Car.findByIdAndUpdate(carId, { avgRating: 0, reviewCount: 0 });
    return;
  }

  await Car.findByIdAndUpdate(carId, {
    avgRating: Number(result[0].avgRating.toFixed(1)),
    reviewCount: result[0].reviewCount,
  });
}

// List reviews of a car (public)
router.get('/car/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }

    const reviews = await Review.find({ car: carId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create review (auth)
router.post('/car/:carId', auth, async (req, res) => {
  try {
    const { carId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const existing = await Review.findOne({ car: carId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this car, use update endpoint' });
    }

    const review = await Review.create({
      car: carId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment || '',
    });

    await refreshCarRating(carId);

    const fullReview = await Review.findById(review._id).populate('user', 'name role');
    res.status(201).json(fullReview);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'You already reviewed this car' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update review (owner or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const canEdit = req.user.role === 'admin' || review.user.toString() === req.user._id.toString();
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (req.body.comment !== undefined) {
      review.comment = req.body.comment;
    }

    await review.save();
    await refreshCarRating(review.car);

    const fullReview = await Review.findById(review._id).populate('user', 'name role');
    res.json(fullReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete review (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const canDelete = req.user.role === 'admin' || review.user.toString() === req.user._id.toString();
    if (!canDelete) return res.status(403).json({ message: 'Forbidden' });

    const carId = review.car;
    await Review.findByIdAndDelete(review._id);
    await refreshCarRating(carId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
