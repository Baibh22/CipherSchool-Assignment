import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__brand">
          <div className="header__logo">
            <span className="header__logo-text">CipherSQLStudio</span>
          </div>
        </Link>
        
        <nav className="header__nav">
          <Link 
            to="/" 
            className={`header__nav-link ${location.pathname === '/' ? 'header__nav-link--active' : ''}`}
          >
            Assignments
          </Link>
          
          <div className="header__status">
            <span className="header__status-dot header__status-dot--online"></span>
            <span className="header__status-text">Online</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;