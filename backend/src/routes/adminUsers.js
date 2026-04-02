const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(auth, isAdmin);

const parseBoolean = (value) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

// Admin: list users
router.get('/', async (req, res) => {
  try {
    const { q, role, isActive } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (q) {
      const keyword = new RegExp(String(q), 'i');
      filter.$or = [{ name: keyword }, { email: keyword }, { phone: keyword }];
    }

    if (role) {
      if (!['user', 'owner', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      filter.role = role;
    }

    const parsedActive = parseBoolean(isActive);
    if (isActive !== undefined && parsedActive === undefined) {
      return res.status(400).json({ message: 'isActive must be true or false' });
    }
    if (parsedActive !== undefined) {
      filter.isActive = parsedActive;
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: get user detail
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update user profile fields
router.patch('/:id/profile', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (req.body.password || req.body.role !== undefined || req.body.isActive !== undefined) {
      return res.status(400).json({ message: 'Use dedicated endpoints for password, role, or status' });
    }

    const payload = {};
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.email !== undefined) payload.email = req.body.email;
    if (req.body.phone !== undefined) payload.phone = req.body.phone;
    if (req.body.address !== undefined) payload.address = req.body.address;
    if (req.body.avatar !== undefined) payload.avatar = req.body.avatar;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: 'No profile fields to update' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update user role
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: lock/unlock account
router.patch('/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const parsedActive = parseBoolean(req.body.isActive);
    if (parsedActive === undefined) {
      return res.status(400).json({ message: 'isActive must be true or false' });
    }

    if (req.user._id.toString() === req.params.id && parsedActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: parsedActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete user
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully', user: deleted });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
