import React from 'react';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) => {
  return (
    <div className={`loading ${className}`}>
      <div className={`loading__spinner loading__spinner--${size}`}></div>
      {showText && <p className="loading__text">{text}</p>}
    </div>
  );
};

export default Loading;