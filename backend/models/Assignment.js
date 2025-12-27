const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  columnName: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    required: true,
    enum: ['INTEGER', 'TEXT', 'REAL', 'BOOLEAN', 'DATE', 'TIMESTAMP']
  }
});

const sampleTableSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: true
  },
  columns: [columnSchema],
  rows: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  question: {
    type: String,
    required: true
  },
  sampleTables: [sampleTableSchema],
  expectedOutput: {
    type: {
      type: String,
      required: true,
      enum: ['table', 'single_value', 'column', 'count', 'row']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  hints: [{
    level: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

assignmentSchema.index({ description: 1 });
assignmentSchema.index({ isActive: 1 });
assignmentSchema.index({ tags: 1 });

assignmentSchema.methods.getFormattedDifficulty = function() {
  const difficultyColors = {
    'Easy': '🟢',
    'Medium': '🟡', 
    'Hard': '🔴'
  };
  return `${difficultyColors[this.description]} ${this.description}`;
};

assignmentSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ 
    description: difficulty, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

assignmentSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { 
        _id: '$description', 
        count: { $sum: 1 } 
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('Assignment', assignmentSchema);