import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Create a new session booking
// @route   POST /api/sessions
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { teacherId, skill, scheduledDate, duration, notes } = req.body;

    // Validate teacher exists and teaches the skill
    const teacher = await User.findById(teacherId);
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'both')) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Check if teacher teaches this skill
    const skillData = teacher.teachingSkills.find(s => s.skill === skill);

    if (!skillData) {
      return res.status(400).json({
        success: false,
        message: 'Teacher does not offer this skill'
      });
    }
    const sessionCost = skillData.hourlyRate * (duration / 60);

    if (req.user.wallet.balance < sessionCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins. You need ${sessionCost} coins but only have ${req.user.wallet.balance}.`
      });
    }

    const startTime = new Date(scheduledDate);
    const sessionDuration = duration || 60;


    // Check availability
    const isAvailable = await Session.checkAvailability(teacherId, startTime, sessionDuration);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Teacher is not available at this time'
      });
    }
    
    // Deduct coins from student wallet immediately on booking
    req.user.wallet.balance -= sessionCost;
    req.user.stats.coinsSpent += sessionCost;
    await req.user.save();

    // Create session (auto-confirm for immediate availability)
    const session = await Session.create({
      student: req.user._id,
      teacher: teacherId,
      skill,
      scheduledDate: startTime,
      duration: sessionDuration,
      price: skillData.hourlyRate,
      notes,
      status: 'confirmed' // Auto-confirm sessions for immediate booking
    });

    console.log('✅ Session created and coins deducted:', session._id);
    
    res.status(201).json({
      success: true,
      data: {
        session
      }
    });
    
  } catch (error) {
    console.error('❌ Session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's sessions
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type } = req.query; // type: 'student' or 'teacher'
    
    let query = {};
    
    if (type === 'student') {
      query.student = req.user._id;
    } else if (type === 'teacher') {
      query.teacher = req.user._id;
    } else {
      // Get all sessions where user is either student or teacher
      query.$or = [
        { student: req.user._id },
        { teacher: req.user._id }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const sessions = await Session.find(query)
      .populate('student', 'name email avatar')
      .populate('teacher', 'name email avatar')
      .sort({ scheduledDate: -1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: {
        sessions
      }
    });
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sessions'
    });
  }
});

// @desc    Update session status
// @route   PUT /api/sessions/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
      const { status, cancellationReason } = req.body;
      
      const session = await Session.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Check if user is authorized
      if (session.student.toString() !== req.user._id.toString() && 
          session.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this session'
        });
      }
      
      // Handle coin transactions based on status change
      if (status === 'completed' && session.status !== 'completed') {
        // Transfer coins to teacher (coins were already deducted from student at booking)
        const teacher = await User.findById(session.teacher);

        if (teacher) {
          // Add coins to teacher's wallet and update stats
          teacher.wallet.balance += session.price;
          teacher.stats.coinsEarned += session.price;

          // Update teacher's skill stats
          const skillIndex = teacher.teachingSkills.findIndex(s => s.skill === session.skill);
          if (skillIndex !== -1) {
            teacher.teachingSkills[skillIndex].sessions += 1;
          }

          await teacher.save();

          console.log(`💰 Coin transfer: ${session.price} coins to teacher`);
        }
      } else if (status === 'cancelled' && req.user._id.toString() === session.student.toString()) {
        // Refund coins to student on cancellation (if cancelled by student)
        const student = await User.findById(session.student);
        if (student) {
          student.wallet.balance += session.price;
          student.stats.coinsSpent -= session.price;
          await student.save();
          console.log(`💰 Coin refund: ${session.price} coins returned to student`);
        }
      }
      
      session.status = status;
      if (status === 'cancelled') {
        session.cancellationReason = cancellationReason;
        session.cancelledBy = req.user._id;
      } else if (status === 'completed') {
        session.completedAt = new Date();
      }
      
      await session.save();
      
      res.status(200).json({
        success: true,
        data: {
          session
        }
      });
      
    } catch (error) {
      console.error('Update session status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating session'
      });
    }
  });

// @desc    Get teacher availability for a specific date
// @route   GET /api/sessions/availability/:teacherId
// @access  Public
router.get('/availability/:teacherId', async (req, res) => {
  try {
    const { date } = req.query;
    const teacherId = req.params.teacherId;
    
    // Get teacher's availability schedule
    const teacher = await User.findById(teacherId).select('availability');
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Get existing sessions for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingSessions = await Session.find({
      teacher: teacherId,
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: startOfDay, $lte: endOfDay }
    }).select('scheduledDate duration');
    
    res.status(200).json({
      success: true,
      data: {
        availability: teacher.availability,
        bookedSlots: existingSessions
      }
    });
    
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching availability'
    });
  }
});

export default router;