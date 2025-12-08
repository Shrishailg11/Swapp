import express from 'express';
import { protect } from '../middleware/auth.js';
import Query from '../models/Query.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Validate ObjectId middleware
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query ID format'
    });
  }
  next();
};

// @desc    Create a new query
// @route   POST /api/queries
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const query = await Query.create({
      title,
      description,
      category,
      author: req.user._id
    });

    // Populate author info
    await query.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      data: {
        query
      }
    });

  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all queries with filters
// @route   GET /api/queries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, limit = 20, page = 1 } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const queries = await Query.find(query)
      .populate('author', 'name avatar')
      .populate('helpers.user', 'name avatar') // Populate helpers as well
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Query.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: queries.length,
      total,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      data: queries
    });

  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching queries'
    });
  }
});

// @desc    Get single query by ID
// @route   GET /api/queries/:id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('responses.responder', 'name avatar')
      .populate('helpers.user', 'name avatar'); // Populate helpers as well
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        query
      }
    });

  } catch (error) {
    console.error('Get query error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching query'
    });
  }
});

// @desc    Update query status
// @route   PUT /api/queries/:id/status
// @access  Private (only author can update)
router.put('/:id/status', protect, validateObjectId, async (req, res) => {
  try {
    const { status } = req.body;
    
    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check if user is the author
    if (query.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this query'
      });
    }
    
    // Validate status
    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    query.status = status;
    await query.save();
    
    // Populate author info
    await query.populate('author', 'name avatar');
    await query.populate('helpers.user', 'name avatar'); // Populate helpers as well
    
    res.status(200).json({
      success: true,
      data: {
        query
      }
    });

  } catch (error) {
    console.error('Update query status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating query status'
    });
  }
});

// @desc    Delete a query
// @route   DELETE /api/queries/:id
// @access  Private (only author can delete)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check if user is the author
    if (query.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this query'
      });
    }
    
    await query.remove();
    
    res.status(200).json({
      success: true,
      message: 'Query removed successfully'
    });

  } catch (error) {
    console.error('Delete query error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting query'
    });
  }
});

// @desc    Express interest in helping with a query
// @route   POST /api/queries/:id/help
// @access  Private
router.post('/:id/help', protect, validateObjectId, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check if user is the author (can't help with own query)
    if (query.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot help with your own query'
      });
    }
    
    // Check if user already expressed interest
    const alreadyHelping = query.helpers.some(helper => 
      helper.user.toString() === req.user._id.toString()
    );
    
    if (alreadyHelping) {
      return res.status(400).json({
        success: false,
        message: 'You have already expressed interest in helping with this query'
      });
    }
    
    // Add user to helpers
    query.helpers.push({ user: req.user._id });
    await query.save();
    
    // Populate helpers
    await query.populate('author', 'name avatar');
    await query.populate('helpers.user', 'name avatar');
    
    res.status(200).json({
      success: true,
      message: 'Interest in helping recorded',
      data: {
        query
      }
    });

  } catch (error) {
    console.error('Help query error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording help interest'
    });
  }
});

export default router;