const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    index: true
  },
  sqlQuery: {
    type: String,
    required: true
  },
  queryResult: {
    success: {
      type: Boolean,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    error: {
      type: String
    },
    executionTime: {
      type: Number
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

userProgressSchema.index({ userId: 1, assignmentId: 1 });

userProgressSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

userProgressSchema.methods.incrementAttempt = function() {
  this.attemptCount += 1;
  this.lastAttempt = new Date();
  return this.save();
};

userProgressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: '$attemptCount' },
        completedAssignments: { 
          $sum: { $cond: ['$isCompleted', 1, 0] } 
        },
        totalHintsUsed: { $sum: '$hintsUsed' },
        averageAttempts: { $avg: '$attemptCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    completedAssignments: 0,
    totalHintsUsed: 0,
    averageAttempts: 0
  };
};

userProgressSchema.statics.findUserProgress = function(userId, assignmentId) {
  return this.findOne({ 
    userId: userId, 
    assignmentId: assignmentId 
  }).populate('assignmentId');
};

module.exports = mongoose.model('UserProgress', userProgressSchema);