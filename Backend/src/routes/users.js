import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

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

    

    const allUserSessions = await Session.find({
      $or: [
        { student: req.user._id },
        { teacher: req.user._id }
      ]
    }).populate('student', 'name avatar').populate('teacher', 'name avatar');

    

    // Now try the original filtered query
    const upcomingSessions = await Session.find({
      $or: [
        { student: req.user._id },
        { teacher: req.user._id }
      ],
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: new Date() } // Only future sessions
    })
    .populate('student', 'name avatar')
    .populate('teacher', 'name avatar')
    .sort({ scheduledDate: 1 })
    .limit(5);

   

    // Format sessions for frontend
    const formattedSessions = upcomingSessions.map(session => ({
      id: session._id,
      type: session.student.toString() === req.user._id.toString() ? 'learning' : 'teaching',
      skill: session.skill,
      teacher: session.student.toString() === req.user._id.toString() ? session.teacher.name : null,
      student: session.teacher.toString() === req.user._id.toString() ? session.student.name : null,
      date: session.scheduledDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: session.scheduledDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: session.scheduledDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: session.status,
      avatar: session.student.toString() === req.user._id.toString() 
        ? (session.teacher.avatar || session.teacher.name.split(' ').map(n => n[0]).join('').toUpperCase())
        : (session.student.avatar || session.student.name.split(' ').map(n => n[0]).join('').toUpperCase())
    }));

    // For now, keep mock messages (we'll implement real chat later)
    const recentMessages = [];
    
    if (upcomingSessions.length > 0) {
      const otherPerson = upcomingSessions[0].student.toString() === req.user._id.toString() 
        ? upcomingSessions[0].teacher 
        : upcomingSessions[0].student;
      
      recentMessages.push({
        id: '1',
        name: otherPerson.name,
        message: `Looking forward to our ${upcomingSessions[0].skill} session!`,
        time: '2 hours ago',
        unread: true,
        avatar: otherPerson.avatar || otherPerson.name.split(' ').map(n => n[0]).join('').toUpperCase()
      });
    }

    // Real stats from user data
    const stats = {
      coinBalance: user.wallet.balance,
      sessionsThisMonth: user.stats.totalSessions,
      studentsTaught: user.role === 'teacher' ? Math.floor(user.stats.totalSessions / 2) : 0,
      averageRating: user.stats.averageRating
    };

    // Personalized quick actions based on user role
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
        upcomingSessions: formattedSessions, // Now real sessions!
        recentMessages,
        stats,
        quickActions,
        hasActivity: upcomingSessions.length > 0 || user.stats.totalSessions > 0
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
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

    // Personalized mock transactions based on user's actual data
    const transactions = [];
    
    if (user.stats.coinsEarned > 0) {
      transactions.push({
        id: '1',
        type: 'earned',
        amount: 25,
        description: user.teachingSkills.length > 0 
          ? `${user.teachingSkills[0].skill} session with Student`
          : 'Tutoring session with Student',
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        time: '2:30 PM',
        status: 'completed'
      });
    }
    
    if (user.stats.coinsSpent > 0) {
      transactions.push({
        id: '2',
        type: 'spent',
        amount: -20,
        description: user.learningSkills.length > 0
          ? `${user.learningSkills[0].skill} lesson with Teacher`
          : 'Learning session with Teacher',
        date: new Date(Date.now() - 172800000).toLocaleDateString(),
        time: '4:00 PM',
        status: 'completed'
      });
    }

    // Real wallet data from user
    const walletData = {
      balance: user.wallet.balance,
      totalEarned: user.stats.coinsEarned,
      totalSpent: user.stats.coinsSpent,
      pendingEarnings: user.wallet.pendingEarnings || 0
    };

    // Personalized earnings summary
    const earningsSummary = {
      thisMonth: Math.floor(user.stats.coinsEarned * 0.3),
      thisWeek: Math.floor(user.stats.coinsEarned * 0.1),
      averagePerSession: user.stats.totalSessions > 0 
        ? Math.floor(user.stats.coinsEarned / user.stats.totalSessions)
        : 25
    };

    // Personalized earnings by skill
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
        earningsBySkill,
        hasTransactions: transactions.length > 0,
        hasTeachingActivity: user.teachingSkills.length > 0
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
