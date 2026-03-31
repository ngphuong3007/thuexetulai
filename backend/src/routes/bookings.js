const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const auth = require('../middleware/auth');

// create booking
router.post('/', auth, async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = days * car.pricePerDay;
    const booking = new Booking({ user: req.user._id, car: car._id, startDate, endDate, totalPrice });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// list user's bookings
router.get('/', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('car');
  res.json(bookings);
});

module.exports = router;
