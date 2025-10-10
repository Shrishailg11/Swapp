import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60,
    min: 30,
    max: 180
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true,
    min: 10
  },
  notes: {
    type: String,
    maxlength: 500
  },
  meetingLink: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ teacher: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1 });
sessionSchema.index({ student: 1, teacher: 1 });

// Update timestamps
sessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for session end time
sessionSchema.virtual('endTime').get(function() {
  return new Date(this.scheduledDate.getTime() + this.duration * 60000);
});

// Static method to check availability
sessionSchema.statics.checkAvailability = async function(teacherId, startTime, duration) {
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  const conflictingSession = await this.findOne({
    teacher: teacherId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        scheduledDate: { $lt: endTime, $gte: startTime }
      },
      {
        $expr: {
          $and: [
            { $lt: ['$scheduledDate', endTime] },
            { $gt: [{ $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] }, startTime] }
          ]
        }
      }
    ]
  });
  
  return !conflictingSession;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;