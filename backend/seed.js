const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Car = require('./src/models/Car');
const Booking = require('./src/models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rental';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data (optional)
    await Booking.deleteMany({});
    await Car.deleteMany({});
    await User.deleteMany({});

    // Create users
    const pass1 = await bcrypt.hash('password123', 10);
    const pass2 = await bcrypt.hash('secret123', 10);

    const user1 = await User.create({ name: 'Nguyen A', email: 'a@example.com', password: pass1, role: 'user' });
    const user2 = await User.create({ name: 'Admin User', email: 'admin@example.com', password: pass2, role: 'admin' });

    // Create cars
    const car1 = await Car.create({
      make: 'Toyota',
      model: 'Vios',
      year: 2020,
      plate: '30A-12345',
      pricePerDay: 500000,
      available: true,
      images: [],
      location: 'Ha Noi'
    });

    const car2 = await Car.create({
      make: 'Honda',
      model: 'City',
      year: 2019,
      plate: '30B-11111',
      pricePerDay: 400000,
      available: true,
      images: [],
      location: 'Ha Noi'
    });

    // Create a booking for user1 and car1
    const booking = await Booking.create({
      user: user1._id,
      car: car1._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      totalPrice: 2 * car1.pricePerDay,
      status: 'confirmed'
    });

    console.log('Seed completed:');
    console.log(' Users:', [user1.email, user2.email]);
    console.log(' Cars:', [car1.plate, car2.plate]);
    console.log(' Booking id:', booking._id.toString());

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
