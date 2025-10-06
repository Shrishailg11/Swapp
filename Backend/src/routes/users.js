import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all teachers (with optional filters)
// @route   GET /api/users/teachers
// @access  Public
router.get('/teachers', async (req, res) => {
  try {
    const { skill, rating, availability, limit = 20, page = 1 } = req.query;
    
    let query = {
      role: { $in: ['teacher', 'both'] }
    };

    // Filter by skill
    if (skill) {
      query['teachingSkills.skill'] = { $regex: skill, $options: 'i' };
    }

    // Filter by minimum rating
    if (rating) {
      query['stats.averageRating'] = { $gte: parseFloat(rating) };
    }

    // Filter by availability (simplified - checks if any day has availability)
    if (availability === 'available') {
      query.$or = [
        { 'availability.monday.available': true },
        { 'availability.tuesday.available': true },
        { 'availability.wednesday.available': true },
        { 'availability.thursday.available': true },
        { 'availability.friday.available': true },
        { 'availability.saturday.available': true },
        { 'availability.sunday.available': true }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teachers = await User.find(query)
      .select('name avatar bio location teachingSkills stats memberSince isOnline')
      .sort({ 'stats.averageRating': -1, 'stats.totalSessions': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: teachers.length,
      total,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      data: teachers
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teachers'
    });
  }
});

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'location', 'avatar', 'role',
      'teachingSkills', 'learningSkills', 'availability'
    ];

    const updates = {};

    // Only update allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

export default router;