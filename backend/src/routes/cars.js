const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const requireRoles = require('../middleware/requireRoles');
const uploadCarImages = require('../middleware/uploadCarImages');

const toNumber = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const buildImageUrls = (req) => {
  if (!req.files || req.files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return req.files.map((file) => `${baseUrl}/uploads/cars/${file.filename}`);
};

const canManageCar = (car, user) => {
  if (user.role === 'admin') return true;
  return car.owner && car.owner.toString() === user._id.toString();
};

// owner/admin my cars page data
router.get('/me/my-cars', auth, requireRoles('owner', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const cars = await Car.find(filter).populate('owner', 'name email role').sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// list cars
router.get('/', async (req, res) => {
  try {
    const { available, q, minPrice, maxPrice } = req.query;
    const filter = {};

    if (available === 'true') filter.available = true;
    if (available === 'false') filter.available = false;
    if (q) filter.$or = [{ make: new RegExp(q, 'i') }, { model: new RegExp(q, 'i') }, { plate: new RegExp(q, 'i') }];
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    const cars = await Car.find(filter).populate('owner', 'name email role').sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get single
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }
    const car = await Car.findById(req.params.id).populate('owner', 'name email role');
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// create (admin/owner)
router.post('/', auth, requireRoles('admin', 'owner'), uploadCarImages.array('images', 6), async (req, res) => {
  try {
    const { make, model, plate } = req.body;
    const pricePerDay = toNumber(req.body.pricePerDay);
    if (!make || !model || !plate || !pricePerDay) {
      return res.status(400).json({ message: 'make, model, plate, pricePerDay are required' });
    }

    // validate unique plate first to avoid duplicate key errors
    if (plate) {
      const exists = await Car.findOne({ plate });
      if (exists) return res.status(400).json({ message: 'Plate already exists' });
    }

    const payload = {
      ...req.body,
      owner: req.user.role === 'owner' ? req.user._id : req.body.owner,
      pricePerDay,
      year: toNumber(req.body.year),
      images: buildImageUrls(req)
    };

    const car = new Car(payload);
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    // handle duplicate key errors gracefully
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error', detail: err.keyValue });
    }
    res.status(400).json({ message: err.message });
  }
});

// update car (admin/owner)
router.put('/:id', auth, requireRoles('admin', 'owner'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }

    const existingCar = await Car.findById(req.params.id);
    if (!existingCar) return res.status(404).json({ message: 'Car not found' });
    if (!canManageCar(existingCar, req.user)) {
      return res.status(403).json({ message: 'You can only manage your own cars' });
    }

    if (req.body.plate) {
      const dup = await Car.findOne({ plate: req.body.plate, _id: { $ne: req.params.id } });
      if (dup) return res.status(400).json({ message: 'Plate already exists' });
    }

    if (req.user.role !== 'admin') {
      delete req.body.owner;
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// update car with image upload (admin/owner)
router.put('/:id/with-images', auth, requireRoles('admin', 'owner'), uploadCarImages.array('images', 6), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }

    const existingCar = await Car.findById(req.params.id);
    if (!existingCar) return res.status(404).json({ message: 'Car not found' });
    if (!canManageCar(existingCar, req.user)) {
      return res.status(403).json({ message: 'You can only manage your own cars' });
    }

    if (req.body.plate) {
      const dup = await Car.findOne({ plate: req.body.plate, _id: { $ne: req.params.id } });
      if (dup) return res.status(400).json({ message: 'Plate already exists' });
    }

    const payload = { ...req.body };
    if (req.body.pricePerDay !== undefined) payload.pricePerDay = toNumber(req.body.pricePerDay);
    if (req.body.year !== undefined) payload.year = toNumber(req.body.year);

    const uploadedImages = buildImageUrls(req);
    if (uploadedImages.length > 0) {
      payload.images = uploadedImages;
    }

    if (req.user.role !== 'admin') {
      delete payload.owner;
    }

    const car = await Car.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete car (admin/owner)
router.delete('/:id', auth, requireRoles('admin', 'owner'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car id' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (!canManageCar(car, req.user)) {
      return res.status(403).json({ message: 'You can only manage your own cars' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
