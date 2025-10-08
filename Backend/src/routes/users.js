import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    console.log('Profile request - req.user:', req.user); // Debug log
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated properly'
      });
    }

    const user = await User.findById(req.user._id).select('-password -__v');
    console.log('Found user:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
});

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


// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get upcoming sessions (mock for now - we'll implement real sessions later)
    const upcomingSessions = [
      {
        id: '1',
        type: user.role === 'teacher' ? 'teaching' : 'learning',
        skill: user.teachingSkills.length > 0 ? user.teachingSkills[0].skill : 'General Tutoring',
        teacher: user.role === 'teacher' ? null : 'Demo Teacher',
        student: user.role === 'teacher' ? 'Demo Student' : null,
        date: 'Today',
        time: '2:00 PM',
        status: 'confirmed',
        avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase()
      }
    ];

    // Get recent messages (mock for now)
    const recentMessages = [
      {
        id: '1',
        name: 'Demo Contact',
        message: 'Looking forward to our session!',
        time: '10 min ago',
        unread: true,
        avatar: 'DC'
      }
    ];

    // Calculate stats
    const stats = {
      coinBalance: user.wallet.balance,
      sessionsThisMonth: user.stats.totalSessions,
      studentsTaught: user.role === 'teacher' ? Math.floor(user.stats.totalSessions / 2) : 0,
      averageRating: user.stats.averageRating
    };

    // Role-based quick actions
    const quickActions = [];
    if (user.role === 'teacher' || user.role === 'both') {
      quickActions.push(
        { id: 'profile', icon: '👨‍🏫', label: 'Update Teaching Profile', link: '/profile' },
        { id: 'availability', icon: '📅', label: 'Set Availability', link: '/profile' }
      );
    }
    if (user.role === 'learner' || user.role === 'both') {
      quickActions.push(
        { id: 'browse', icon: '🔍', label: 'Find Teachers', link: '/browse' },
        { id: 'skills', icon: '📚', label: 'Update Learning Goals', link: '/profile' }
      );
    }
    quickActions.push(
      { id: 'wallet', icon: '💰', label: 'Buy Coins', link: '/wallet' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        },
        upcomingSessions,
        recentMessages,
        stats,
        quickActions
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user wallet data
// @route   GET /api/users/wallet
// @access  Private
router.get('/wallet', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mock transactions for now (we'll implement real transactions later)
    const transactions = [
      {
        id: '1',
        type: 'earned',
        amount: 25,
        description: user.teachingSkills.length > 0 
          ? `${user.teachingSkills[0].skill} session with Demo Student`
          : 'Tutoring session with Demo Student',
        date: new Date().toLocaleDateString(),
        time: '2:30 PM',
        status: 'completed'
      },
      {
        id: '2',
        type: 'spent',
        amount: -20,
        description: user.learningSkills.length > 0
          ? `${user.learningSkills[0].skill} lesson with Demo Teacher`
          : 'Learning session with Demo Teacher',
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        time: '4:00 PM',
        status: 'completed'
      }
    ];

    // Calculate wallet summary
    const walletData = {
      balance: user.wallet.balance,
      totalEarned: user.stats.coinsEarned,
      totalSpent: user.stats.coinsSpent,
      pendingEarnings: user.wallet.pendingEarnings || 0
    };

    // Earnings summary (mock calculations for now)
    const earningsSummary = {
      thisMonth: Math.floor(user.stats.coinsEarned * 0.3),
      thisWeek: Math.floor(user.stats.coinsEarned * 0.1),
      averagePerSession: user.stats.totalSessions > 0 
        ? Math.floor(user.stats.coinsEarned / user.stats.totalSessions)
        : 25
    };

    // Earnings by skill (mock data based on user's teaching skills)
    const earningsBySkill = user.teachingSkills.map((skill, index) => ({
      skill: skill.skill,
      sessions: skill.sessions,
      earnings: skill.sessions * skill.hourlyRate,
      rate: skill.hourlyRate
    }));

    res.status(200).json({
      success: true,
      data: {
        walletData,
        transactions,
        earningsSummary,
        earningsBySkill
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wallet data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
