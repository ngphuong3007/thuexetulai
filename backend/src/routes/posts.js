const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Post = require('../models/Post');
const auth = require('../middleware/auth');
const requireRoles = require('../middleware/requireRoles');
const isAdmin = require('../middleware/isAdmin');

// Public board feed
router.get('/', async (req, res) => {
  try {
    const { postType, location } = req.query;
    const filter = { active: true, status: 'approved' };
    if (postType) filter.postType = postType;
    if (location) filter.location = new RegExp(location, 'i');

    const posts = await Post.find(filter)
      .populate('author', 'name email role')
      .populate('car', 'make model plate images pricePerDay location')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create board post (user/owner/admin)
router.post('/', auth, requireRoles('user', 'owner', 'admin'), async (req, res) => {
  try {
    const { postType, title, content, location, contactPhone, budgetPerDay, car } = req.body;
    if (!postType || !title || !content || !location) {
      return res.status(400).json({ message: 'postType, title, content, location are required' });
    }
    if (!['rent_request', 'car_offer'].includes(postType)) {
      return res.status(400).json({ message: 'postType must be rent_request or car_offer' });
    }

    if (postType === 'car_offer' && car) {
      if (!mongoose.Types.ObjectId.isValid(car)) {
        return res.status(400).json({ message: 'Invalid car id' });
      }
    }

    const post = await Post.create({
      author: req.user._id,
      postType,
      title,
      content,
      location,
      contactPhone,
      budgetPerDay,
      car,
      status: 'pending',
      active: true,
    });

    const fullPost = await Post.findById(post._id)
      .populate('author', 'name email role')
      .populate('car', 'make model plate images pricePerDay location');

    res.status(201).json(fullPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// My posts
router.get('/me/list', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('car', 'make model plate images pricePerDay location')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update post (owner of post or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const canEdit = req.user.role === 'admin' || post.author.toString() === req.user._id.toString();
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    const payload = { ...req.body };
    // If non-admin edits a post, it must be re-approved.
    if (req.user.role !== 'admin') {
      payload.status = 'pending';
      payload.reviewedBy = null;
      payload.reviewedAt = null;
      payload.reviewNote = null;
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
      .populate('author', 'name email role')
      .populate('car', 'make model plate images pricePerDay location');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list pending posts for moderation
router.get('/admin/pending', auth, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' })
      .populate('author', 'name email role')
      .populate('car', 'make model plate images pricePerDay location')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: approve post
router.patch('/admin/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.status = 'approved';
    post.active = true;
    post.reviewedBy = req.user._id;
    post.reviewedAt = new Date();
    post.reviewNote = req.body.reviewNote || null;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: reject post
router.patch('/admin/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.status = 'rejected';
    post.active = false;
    post.reviewedBy = req.user._id;
    post.reviewedAt = new Date();
    post.reviewNote = req.body.reviewNote || null;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete post (owner of post or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const canDelete = req.user.role === 'admin' || post.author.toString() === req.user._id.toString();
    if (!canDelete) return res.status(403).json({ message: 'Forbidden' });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
