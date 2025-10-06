import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['learner', 'teacher', 'both'],
    default: 'learner'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  
  // Skills
  teachingSkills: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    hourlyRate: {
      type: Number,
      min: 10,
      max: 200,
      default: 25
    },
    sessions: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  }],
  
  learningSkills: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // Availability
  availability: {
    monday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    tuesday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    wednesday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    thursday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    friday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    saturday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    },
    sunday: {
      available: { type: Boolean, default: false },
      hours: { type: String, default: '' }
    }
  },
  
  // Statistics
  stats: {
    totalSessions: { type: Number, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    coinsSpent: { type: Number, default: 0 }
  },

  // Wallet
  wallet: {
    balance: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'teachingSkills.skill': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });

// Virtual for coin balance
userSchema.virtual('coinBalance').get(function() {
  return this.wallet.balance;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find teachers by skill
userSchema.statics.findTeachersBySkill = function(skill, options = {}) {
  const query = {
    role: { $in: ['teacher', 'both'] },
    'teachingSkills.skill': { $regex: skill, $options: 'i' }
  };

  return this.find(query)
    .select('name avatar bio location teachingSkills rating stats memberSince')
    .sort(options.sort || { 'stats.averageRating': -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

const User = mongoose.model('User', userSchema);

export default User;