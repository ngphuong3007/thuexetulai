const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// connect DB
connectDB();

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/reviews', require('./routes/reviews'));

// unified error response (includes multer validation errors)
app.use((err, req, res, next) => {
	if (err) {
		return res.status(400).json({ message: err.message || 'Bad request' });
	}
	next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
