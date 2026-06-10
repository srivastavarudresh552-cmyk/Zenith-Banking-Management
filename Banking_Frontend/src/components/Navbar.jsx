import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-max w-100">
        <Link to="/" className="navbar-brand">
          <i className="bi bi-building me-2"></i>Zenith Banking System
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/accounts" className="nav-link" onClick={() => setIsOpen(false)}>
                    Accounts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/transfer" className="nav-link" onClick={() => setIsOpen(false)}>
                    Transfer
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user?.name || 'User'}</span>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm ms-2"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-light btn-sm ms-2" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
