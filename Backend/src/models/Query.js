import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['mathematics', 'science', 'programming', 'languages', 'music', 'art', 'other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  // Track responses to this query
  responses: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      maxlength: [500, 'Response message cannot be more than 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Track when someone expresses interest in helping
  helpers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
querySchema.index({ category: 1, status: 1 });
querySchema.index({ author: 1 });
querySchema.index({ status: 1 });
querySchema.index({ createdAt: -1 }); // Newest first

// Update timestamps
querySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Query = mongoose.model('Query', querySchema);

export default Query;