const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// create booking
router.post('/', auth, async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate or endDate format' });
    }
    if (end <= start) {
      return res.status(400).json({ message: 'endDate must be later than startDate' });
    }

    // validate carId
    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Invalid or missing carId' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const overlap = await Booking.findOne({
      car: car._id,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });
    if (overlap) {
      return res.status(400).json({ message: 'Car is already booked in this date range' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;
    const booking = new Booking({ user: req.user._id, car: car._id, startDate: start, endDate: end, totalPrice });
    await booking.save();

    const fullBooking = await Booking.findById(booking._id).populate('car').populate('user', 'name email role');
    res.status(201).json(fullBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// list user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// admin list all bookings
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('car').populate('user', 'name email role').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get booking detail (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }
    const booking = await Booking.findById(req.params.id).populate('car').populate('user', 'name email role');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// cancel booking (owner or admin)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// admin update booking status
router.patch('/admin/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
