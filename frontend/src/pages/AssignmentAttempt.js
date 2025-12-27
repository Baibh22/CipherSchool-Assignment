// Assignment Attempt page - SQL editor and query execution
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentAPI, queryAPI, hintAPI, handleAPIError } from '../utils/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const AssignmentAttempt = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  // Fetch assignment details
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch assignment details
        const assignmentResponse = await assignmentAPI.getById(id);
        if (assignmentResponse.success) {
          setAssignment(assignmentResponse.data);
        }
        
        // Fetch sample data
        const sampleDataResponse = await assignmentAPI.getSampleData(id);
        if (sampleDataResponse.success) {
          setSampleData(sampleDataResponse.data);
        }
        
      } catch (err) {
        setError(handleAPIError(err, 'Failed to load assignment'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id]);

  // Execute SQL query
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      alert('Please enter a SQL query');
      return;
    }

    try {
      setQueryLoading(true);
      const response = await queryAPI.execute({
        query: sqlQuery,
        assignmentId: id,
        userId: 'demo_user'
      });

      if (response.success) {
        setQueryResult(response.data.result);
      } else {
        setQueryResult({
          success: false,
          error: response.error || 'Query execution failed'
        });
      }
    } catch (err) {
      setQueryResult({
        success: false,
        error: handleAPIError(err, 'Failed to execute query')
      });
    } finally {
      setQueryLoading(false);
    }
  };

  // Get AI hint
  const handleGetHint = async () => {
    try {
      setHintLoading(true);
      const response = await hintAPI.generate({
        assignmentId: id,
        userQuery: sqlQuery,
        userId: 'demo_user'
      });

      if (response.success) {
        setHint(response.data.hint);
      } else {
        setHint('Sorry, unable to generate hint at this time.');
      }
    } catch (err) {
      console.error('Hint API Error:', err);
      const errorMessage = err.message || 'Hint service is currently unavailable.';
      
      // Provide fallback hints based on assignment
      if (assignment) {
        const fallbackHint = getFallbackHint(assignment, sqlQuery);
        setHint(fallbackHint);
      } else if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
        setHint('API quota exceeded. Please try again in a few minutes.');
      } else if (errorMessage.includes('API key')) {
        setHint('API configuration issue. Please check settings.');
      } else {
        setHint('Hint service is currently unavailable.');
      }
    } finally {
      setHintLoading(false);
    }
  };

  // Fallback hint system
  const getFallbackHint = (assignment, userQuery) => {
    const question = assignment.question.toLowerCase();
    const query = userQuery.toLowerCase();

    // Count-related questions
    if (question.includes('count') || question.includes('total number')) {
      if (!query.includes('count')) {
        return "💡 Hint: This question asks for a 'count' or 'total number'. Try using the COUNT() function in SQL.";
      } else if (query.includes('count') && !query.includes('count(')) {
        return "💡 Hint: You're on the right track with COUNT, but remember COUNT needs parentheses. Try COUNT(*) to count all rows.";
      } else {
        return "💡 Hint: Great! You're using COUNT(). Make sure your query structure is: SELECT COUNT(*) FROM table_name;";
      }
    }

    // WHERE clause questions
    if (question.includes('older than') || question.includes('greater than') || question.includes('filter')) {
      if (!query.includes('where')) {
        return "💡 Hint: This question requires filtering data. Use the WHERE clause to filter rows based on conditions.";
      } else {
        return "💡 Hint: Good! You're using WHERE. Make sure to use comparison operators like >, <, =, etc.";
      }
    }

    // JOIN questions
    if (question.includes('join') || question.includes('customer') && question.includes('order')) {
      if (!query.includes('join')) {
        return "💡 Hint: This question requires combining data from multiple tables. Look into using JOIN operations.";
      } else {
        return "💡 Hint: Great! You're using JOIN. Make sure to specify the relationship between tables using ON clause.";
      }
    }

    // GROUP BY questions
    if (question.includes('group') || question.includes('category') && question.includes('count')) {
      if (!query.includes('group')) {
        return "💡 Hint: This question requires grouping data. Use GROUP BY to group rows with similar values.";
      } else {
        return "💡 Hint: Good! You're using GROUP BY. Don't forget you might need HAVING to filter grouped results.";
      }
    }

    // Generic hint
    return "💡 Hint: Break down the question into parts: What data do you need? From which table? Any conditions or grouping required?";
  };

  if (loading) {
    return (
      <div className="assignment-attempt">
        <div className="assignment-attempt__container">
          <Loading text="Loading assignment..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-attempt">
        <div className="assignment-attempt__container">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="assignment-attempt">
        <div className="assignment-attempt__container">
          <ErrorMessage error="Assignment not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-attempt">
      <div className="assignment-attempt__container">
        {/* Header */}
        <div className="assignment-attempt__header">
          <Link to="/" className="assignment-attempt__back-link">
            ← Back to Assignments
          </Link>
          <h1 className="assignment-attempt__title">{assignment.title}</h1>
          <div className="assignment-attempt__meta">
            <span className={`assignment-attempt__difficulty assignment-attempt__difficulty--${assignment.description.toLowerCase()}`}>
              {assignment.description}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="assignment-attempt__layout">
          {/* Left Panel */}
          <div className="assignment-attempt__left-panel">
            {/* Question Panel */}
            <div className="question-panel">
              <div className="question-panel__header">
                <h2 className="question-panel__title">Question</h2>
              </div>
              <div className="question-panel__content">
                <p>{assignment.question}</p>
              </div>
            </div>

            {/* Sample Data Panel */}
            {sampleData && (
              <div className="sample-data-panel">
                <div className="sample-data-panel__header">
                  <h2 className="sample-data-panel__title">Sample Data</h2>
                </div>
                <div className="sample-data-panel__content">
                  <div className="sample-data-panel__table-list">
                    {sampleData.tables.map((table, index) => (
                      <div key={index} className="table-preview">
                        <div className="table-preview__header">
                          <h3 className="table-preview__title">{table.tableName}</h3>
                          <p className="table-preview__info">
                            {table.columns.length} columns, {table.rowCount} rows
                          </p>
                        </div>
                        {table.sampleRows.length > 0 ? (
                          <table className="table-preview__table">
                            <thead>
                              <tr>
                                {table.columns.map((col, colIndex) => (
                                  <th key={colIndex}>{col.columnName}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.sampleRows.slice(0, 3).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {table.columns.map((col, colIndex) => (
                                    <td key={colIndex}>{row[col.columnName]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="table-preview__empty">No sample data available</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="assignment-attempt__right-panel">
            {/* SQL Editor */}
            <div className="sql-editor">
              <div className="sql-editor__header">
                <h2 className="sql-editor__title">SQL Editor</h2>
                <div className="sql-editor__actions">
                  <button 
                    className="btn btn--secondary btn--small"
                    onClick={() => setSqlQuery('')}
                  >
                    Clear
                  </button>
                  <button 
                    className="btn btn--primary btn--small"
                    onClick={handleExecuteQuery}
                    disabled={queryLoading || !sqlQuery.trim()}
                  >
                    {queryLoading ? 'Executing...' : 'Execute Query'}
                  </button>
                </div>
              </div>
              <div className="sql-editor__editor-container">
                <textarea
                  className="sql-editor__textarea"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  rows={10}
                />
              </div>
              <div className="sql-editor__footer">
                <span>Tip: Use SELECT statements only</span>
              </div>
            </div>

            {/* Results Panel */}
            <div className="results-panel">
              <div className="results-panel__header">
                <h2 className="results-panel__title">Query Results</h2>
                {queryResult && (
                  <div className="results-panel__status">
                    {queryResult.success ? (
                      <span className="badge badge--success">Success</span>
                    ) : (
                      <span className="badge badge--danger">Error</span>
                    )}
                  </div>
                )}
              </div>
              <div className="results-panel__content">
                {!queryResult ? (
                  <div className="results-panel__empty">
                    Execute a query to see results here
                  </div>
                ) : queryResult.success ? (
                  queryResult.data && queryResult.data.length > 0 ? (
                    <table className="results-panel__table">
                      <thead>
                        <tr>
                          {Object.keys(queryResult.data[0]).map((key, index) => (
                            <th key={index}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, valueIndex) => (
                              <td key={valueIndex}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="results-panel__success-message">
                      Query executed successfully. No rows returned.
                    </div>
                  )
                ) : (
                  <div className="results-panel__error">
                    {queryResult.error}
                  </div>
                )}
              </div>
            </div>

            {/* Hint Panel */}
            <div className="hint-panel">
              <div className="hint-panel__header">
                <h2 className="hint-panel__title">Hint</h2>
                <button 
                  className="btn btn--secondary btn--small"
                  onClick={handleGetHint}
                  disabled={hintLoading}
                >
                  {hintLoading ? 'Getting Hint...' : 'Get Hint'}
                </button>
              </div>
              <div className="hint-panel__content">
                {hint ? (
                  <div className="hint-panel__hint">
                    {hint}
                  </div>
                ) : (
                  <div className="hint-panel__content--empty">
                    Click "Get Hint" for guidance
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentAttempt;