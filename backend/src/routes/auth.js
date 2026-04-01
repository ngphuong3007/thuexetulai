const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');

// register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const allowedRegisterRoles = ['user', 'owner'];
    const finalRole = allowedRegisterRoles.includes(role) ? role : 'user';

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashed, role: finalRole });
    await user.save();
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// current user profile
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// update current user profile
router.put('/me', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (req.body.email) {
      return res.status(400).json({ message: 'Email update is not supported in this endpoint' });
    }

    const payload = {};
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.phone !== undefined) payload.phone = req.body.phone;
    if (req.body.address !== undefined) payload.address = req.body.address;

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      payload.avatar = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    }

    const updated = await User.findByIdAndUpdate(req.user._id, payload, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// change password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
