import React from 'react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  className = '',
  showRetry = true 
}) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-message__icon">⚠️</div>
      <div className="error-message__content">
        <h3 className="error-message__title">Something went wrong</h3>
        <p className="error-message__text">
          {error || 'An unexpected error occurred. Please try again.'}
        </p>
        {showRetry && onRetry && (
          <button 
            className="error-message__retry-btn"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;