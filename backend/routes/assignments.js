const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
router.get('/', async (req, res) => {
  try {
    const { difficulty, limit = 10, page = 1 } = req.query;
    
    const filter = { isActive: true };
    if (difficulty) {
      filter.description = difficulty;
    }
    
    const skip = (page - 1) * limit;
    
    const assignments = await Assignment.find(filter)
      .select('title description question tags createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Assignment.countDocuments(filter);
    
    const stats = await Assignment.getStats();
    
    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: assignments.length,
          totalAssignments: total
        },
        stats
      }
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment ID format'
      });
    }
    
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    if (!assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Assignment is not available'
      });
    }
    
    res.json({
      success: true,
      data: assignment
    });
    
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment',
      message: error.message
    });
  }
});

router.get('/difficulty/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    const validLevels = ['Easy', 'Medium', 'Hard'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level. Must be Easy, Medium, or Hard'
      });
    }
    
    const assignments = await Assignment.findByDifficulty(level);
    
    res.json({
      success: true,
      data: {
        difficulty: level,
        count: assignments.length,
        assignments: assignments.map(assignment => ({
          _id: assignment._id,
          title: assignment.title,
          question: assignment.question,
          tags: assignment.tags,
          createdAt: assignment.createdAt,
          formattedDifficulty: assignment.getFormattedDifficulty()
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching assignments by difficulty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments by difficulty',
      message: error.message
    });
  }
});

router.get('/:id/sample-data', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findById(id).select('sampleTables title');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    const formattedTables = assignment.sampleTables.map(table => ({
      tableName: table.tableName,
      columns: table.columns,
      rowCount: Array.isArray(table.rows) ? table.rows.length : 0,
      sampleRows: Array.isArray(table.rows) ? table.rows.slice(0, 5) : []
    }));
    
    res.json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        tables: formattedTables
      }
    });
    
  } catch (error) {
    console.error('Error fetching sample data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sample data',
      message: error.message
    });
  }
});

module.exports = router;