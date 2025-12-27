const express = require('express');
const router = express.Router();
const axios = require('axios');
const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');

const getOpenAIHint = async (prompt) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful SQL tutor. Provide hints and guidance for SQL problems, but NEVER give the complete solution. 
          Your hints should:
          1. Guide the student's thinking process
          2. Suggest which SQL concepts to use
          3. Point out common mistakes
          4. Ask leading questions
          5. NEVER provide the exact SQL query
          
          Keep hints concise and educational.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
  }
};

const getGeminiHint = async (prompt) => {
  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: `You are a helpful SQL tutor. Provide hints and guidance for SQL problems, but NEVER give the complete solution. 
          Your hints should:
          1. Guide the student's thinking process
          2. Suggest which SQL concepts to use
          3. Point out common mistakes
          4. Ask leading questions
          5. NEVER provide the exact SQL query
          
          Keep hints concise and educational.
          
          Question: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error Details:', error.response?.data);
    throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
  }
};

router.post('/generate', async (req, res) => {
  try {
    const { assignmentId, userQuery, userId = 'anonymous' } = req.body;
    
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required'
      });
    }
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    const tableInfo = assignment.sampleTables.map(table => {
      const columns = table.columns.map(col => `${col.columnName} (${col.dataType})`).join(', ');
      return `Table: ${table.tableName}\nColumns: ${columns}`;
    }).join('\n\n');
    
    const prompt = `
SQL Assignment: ${assignment.title}
Difficulty: ${assignment.description}

Question: ${assignment.question}

Available Tables:
${tableInfo}

${userQuery ? `Student's current query attempt: ${userQuery}` : 'Student is asking for a hint to get started.'}

Please provide a helpful hint that guides the student toward the solution without giving away the answer.`;

    let hint;
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo_key') {
      hint = await getGeminiHint(prompt);
    } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo_key') {
      hint = await getOpenAIHint(prompt);
    } else {
      return res.status(500).json({
        success: false,
        error: 'No valid LLM API key configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in environment variables.'
      });
    }
    
    if (userId !== 'anonymous') {
      try {
        let progress = await UserProgress.findUserProgress(userId, assignmentId);
        
        if (progress) {
          progress.hintsUsed += 1;
          await progress.save();
        } else {
          progress = new UserProgress({
            userId,
            assignmentId,
            sqlQuery: userQuery || '',
            hintsUsed: 1
          });
          await progress.save();
        }
      } catch (progressError) {
        console.error('Error updating hint usage:', progressError);
      }
    }
    
    res.json({
      success: true,
      data: {
        hint,
        assignmentTitle: assignment.title,
        difficulty: assignment.description,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hint',
      message: error.message
    });
  }
});

router.get('/predefined/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId).select('title description hints');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    const sortedHints = assignment.hints.sort((a, b) => a.level - b.level);
    
    res.json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        difficulty: assignment.description,
        hints: sortedHints.map(hint => ({
          level: hint.level,
          content: hint.content
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching predefined hints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hints',
      message: error.message
    });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { assignmentId, userQuery, queryResult } = req.body;
    
    if (!assignmentId || !userQuery) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID and user query are required'
      });
    }
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    const prompt = `
SQL Assignment: ${assignment.title}
Question: ${assignment.question}

Student's Query: ${userQuery}
Query Result: ${queryResult ? (queryResult.success ? 'Success' : `Error: ${queryResult.error}`) : 'Not executed'}

Please provide constructive feedback on the student's SQL query. Focus on:
1. What they did well
2. What could be improved
3. Specific suggestions for better SQL practices
4. If there's an error, explain what might be causing it

Do NOT provide the correct solution, just helpful feedback.`;

    let feedback;
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo_key') {
      feedback = await getGeminiHint(prompt);
    } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo_key') {
      feedback = await getOpenAIHint(prompt);
    } else {
      return res.status(500).json({
        success: false,
        error: 'No LLM API key configured'
      });
    }
    
    res.json({
      success: true,
      data: {
        feedback,
        assignmentTitle: assignment.title,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate feedback',
      message: error.message
    });
  }
});

module.exports = router;