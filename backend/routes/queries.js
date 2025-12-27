const express = require('express');
const router = express.Router();
const { postgresPool } = require('../config/database');
const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');

const sanitizeQuery = (query) => {
  const dangerousPatterns = [
    /\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)\b/gi,
    /\b(EXEC|EXECUTE)\b/gi,
    /--/g,
    /\/\*/g,
    /\*\//g,
  ];
  
  let sanitized = query.trim();
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Query contains potentially dangerous SQL commands');
    }
  }
  
  if (!sanitized.endsWith(';')) {
    sanitized += ';';
  }
  
  return sanitized;
};

const createUserWorkspace = async (userId, assignmentId) => {
  const client = await postgresPool.connect();
  
  try {
    const schemaName = `workspace_${userId}_${assignmentId}`.replace(/[^a-zA-Z0-9_]/g, '_');
    
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    await client.query(`SET search_path TO ${schemaName}`);
    
    for (const table of assignment.sampleTables) {
      await client.query(`DROP TABLE IF EXISTS ${table.tableName}`);
      
      const columns = table.columns.map(col => 
        `${col.columnName} ${col.dataType}`
      ).join(', ');
      
      await client.query(`CREATE TABLE ${table.tableName} (${columns})`);
      
      if (table.rows && table.rows.length > 0) {
        const columnNames = table.columns.map(col => col.columnName).join(', ');
        
        for (const row of table.rows) {
          const values = table.columns.map(col => {
            const value = row[col.columnName];
            if (value === null || value === undefined) return 'NULL';
            if (col.dataType === 'TEXT') return `'${value}'`;
            return value;
          }).join(', ');
          
          await client.query(`INSERT INTO ${table.tableName} (${columnNames}) VALUES (${values})`);
        }
      }
    }
    
    return schemaName;
    
  } finally {
    client.release();
  }
};

router.post('/execute', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { query, assignmentId, userId = 'anonymous' } = req.body;
    
    if (!query || !assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Query and assignmentId are required'
      });
    }
    
    let sanitizedQuery;
    try {
      sanitizedQuery = sanitizeQuery(query);
    } catch (sanitizeError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query',
        message: sanitizeError.message
      });
    }
    
    const schemaName = await createUserWorkspace(userId, assignmentId);
    
    const client = await postgresPool.connect();
    let queryResult;
    
    try {
      await client.query(`SET search_path TO ${schemaName}`);
      
      const result = await client.query(sanitizedQuery);
      
      queryResult = {
        success: true,
        data: result.rows,
        rowCount: result.rowCount,
        fields: result.fields ? result.fields.map(field => ({
          name: field.name,
          dataTypeID: field.dataTypeID
        })) : []
      };
      
    } catch (queryError) {
      queryResult = {
        success: false,
        error: queryError.message,
        code: queryError.code
      };
    } finally {
      client.release();
    }
    
    const executionTime = Date.now() - startTime;
    
    if (userId !== 'anonymous') {
      try {
        let progress = await UserProgress.findUserProgress(userId, assignmentId);
        
        if (progress) {
          progress.sqlQuery = query;
          progress.queryResult = { ...queryResult, executionTime };
          await progress.incrementAttempt();
        } else {
          progress = new UserProgress({
            userId,
            assignmentId,
            sqlQuery: query,
            queryResult: { ...queryResult, executionTime }
          });
          await progress.save();
        }
      } catch (progressError) {
        console.error('Error saving user progress:', progressError);
      }
    }
    
    res.json({
      success: true,
      data: {
        query: sanitizedQuery,
        result: queryResult,
        executionTime,
        workspace: schemaName
      }
    });
    
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute query',
      message: error.message,
      executionTime: Date.now() - startTime
    });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    try {
      const sanitizedQuery = sanitizeQuery(query);
      
      res.json({
        success: true,
        data: {
          isValid: true,
          sanitizedQuery,
          message: 'Query syntax is valid'
        }
      });
      
    } catch (sanitizeError) {
      res.json({
        success: true,
        data: {
          isValid: false,
          error: sanitizeError.message,
          suggestions: [
            'Remove any DROP, DELETE, INSERT, UPDATE commands',
            'Use only SELECT statements',
            'Remove SQL comments (-- or /* */)'
          ]
        }
      });
    }
    
  } catch (error) {
    console.error('Error validating query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate query',
      message: error.message
    });
  }
});

module.exports = router;