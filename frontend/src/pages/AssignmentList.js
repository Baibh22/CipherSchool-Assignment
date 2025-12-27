import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI, handleAPIError } from '../utils/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const fetchAssignments = async (difficulty = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (difficulty) {
        response = await assignmentAPI.getByDifficulty(difficulty);
      } else {
        response = await assignmentAPI.getAll();
      }
      
      if (response.success) {
        setAssignments(response.data.assignments || response.data.assignments || []);
        setStats(response.data.stats || {});
      } else {
        throw new Error(response.error || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError(handleAPIError(err, 'Failed to load assignments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    fetchAssignments(difficulty);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'assignment-card__difficulty--easy';
      case 'Medium':
        return 'assignment-card__difficulty--medium';
      case 'Hard':
        return 'assignment-card__difficulty--hard';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="assignment-list">
        <div className="assignment-list__container">
          <Loading text="Loading assignments..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-list">
        <div className="assignment-list__container">
          <ErrorMessage 
            error={error} 
            onRetry={() => fetchAssignments(selectedDifficulty)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-list">
      <div className="assignment-list__container">
        <div className="assignment-list__header">
          <div className="assignment-list__brand">
            <h1 className="assignment-list__brand-title">Cipher School Studio</h1>
            <p className="assignment-list__brand-subtitle">SQL Learning Platform</p>
          </div>
          <h2 className="assignment-list__title">SQL Assignments</h2>
          <p className="assignment-list__subtitle">
            Practice SQL with interactive assignments and get AI-powered hints
          </p>
        </div>

        {Object.keys(stats).length > 0 && (
          <div className="assignment-stats">
            <div className="assignment-stats__grid">
              {Object.entries(stats).map(([difficulty, count]) => (
                <div key={difficulty} className="assignment-stats__item">
                  <span className={`assignment-stats__count ${getDifficultyClass(difficulty)}`}>
                    {count}
                  </span>
                  <span className="assignment-stats__label">{difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="assignment-filters">
          <div className="assignment-filters__group">
            <label className="assignment-filters__label">Filter by difficulty:</label>
            <div className="assignment-filters__buttons">
              <button
                className={`assignment-filters__btn ${selectedDifficulty === '' ? 'assignment-filters__btn--active' : ''}`}
                onClick={() => handleDifficultyChange('')}
              >
                All
              </button>
              <button
                className={`assignment-filters__btn ${selectedDifficulty === 'Easy' ? 'assignment-filters__btn--active' : ''}`}
                onClick={() => handleDifficultyChange('Easy')}
              >
                Easy
              </button>
              <button
                className={`assignment-filters__btn ${selectedDifficulty === 'Medium' ? 'assignment-filters__btn--active' : ''}`}
                onClick={() => handleDifficultyChange('Medium')}
              >
                Medium
              </button>
              <button
                className={`assignment-filters__btn ${selectedDifficulty === 'Hard' ? 'assignment-filters__btn--active' : ''}`}
                onClick={() => handleDifficultyChange('Hard')}
              >
                Hard
              </button>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="assignment-list__empty">
            <div className="assignment-list__empty-icon">📝</div>
            <h3 className="assignment-list__empty-title">No assignments found</h3>
            <p className="assignment-list__empty-text">
              {selectedDifficulty 
                ? `No ${selectedDifficulty.toLowerCase()} assignments available.`
                : 'No assignments are currently available.'
              }
            </p>
          </div>
        ) : (
          <div className="assignment-grid">
            {assignments.map((assignment) => (
              <Link
                key={assignment._id}
                to={`/assignment/${assignment._id}`}
                className="assignment-card"
              >
                <div className="assignment-card__header">
                  <h3 className="assignment-card__title">{assignment.title}</h3>
                  <span className={`assignment-card__difficulty ${getDifficultyClass(assignment.description)}`}>
                    {assignment.description}
                  </span>
                </div>
                
                <p className="assignment-card__question">
                  {assignment.question}
                </p>
                
                {assignment.tags && assignment.tags.length > 0 && (
                  <div className="assignment-card__tags">
                    {assignment.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="assignment-card__tag">
                        {tag}
                      </span>
                    ))}
                    {assignment.tags.length > 3 && (
                      <span className="assignment-card__tag assignment-card__tag--more">
                        +{assignment.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="assignment-card__footer">
                  <span className="assignment-card__date">
                    Created {formatDate(assignment.createdAt)}
                  </span>
                  <span className="assignment-card__arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;