import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(authService.isAuthenticated());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  // Hide navbar on Safari page — Safari has its own header
  if (location.pathname === '/' || location.pathname === '/safari') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon"><img src="./logo/logo_rs_project.png" width={40} height={40} alt="" /></span>
          <span className="logo-text">Safari<span className="highlight">AI</span></span>
      </div>
      <div className="nav-links">
          <Link to="/" className="nav-item safari-nav-link">← Retour à Safari</Link>
      </div>
      <div className="nav-auth">
          {isLoggedIn ? (
            <>
              <button className="auth-btn login-btn" onClick={() => navigate('/profile')}>My Profile</button>
              <button className="auth-btn register-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="auth-btn login-btn" onClick={() => navigate('/login')}>Login</button>
              <button className="auth-btn register-btn" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
      </div>
    </nav>
  );
}

export default Navbar;
