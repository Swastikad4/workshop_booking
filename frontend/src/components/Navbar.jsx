import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside of the user dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || user.username[0].toUpperCase();
  };

  return (
    <nav className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-pill">
        {/* Brand Section */}
        <Link to={user ? '/dashboard' : '/login'} className="navbar-brand">
          FOSSEE <span className="brand-accent">Workshops</span>
        </Link>

        {/* Desktop Links */}
        <ul className={`navbar-links ${mobileOpen ? 'mobile-active' : ''}`}>
          <li>
            <NavLink to="/" onClick={() => setMobileOpen(false)}>
              <span className="nav-icon">🏠</span> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/statistics" onClick={() => setMobileOpen(false)}>
              <span className="nav-icon">📊</span> Statistics
            </NavLink>
          </li>

          {user && (
            <>
              <li>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                  Status
                </NavLink>
              </li>
              {!user.is_instructor && (
                <li>
                  <NavLink to="/propose-workshop" onClick={() => setMobileOpen(false)}>
                    Propose
                  </NavLink>
                </li>
              )}
            </>
          )}
        </ul>

        {/* User / Auth Section */}
        <div className="navbar-right">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                className="user-pill-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-circle">{getInitials()}</div>
                <span className="user-label">{user.full_name || user.username}</span>
                <span className="chevron">▾</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-card">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <a href="http://127.0.0.1:8000/reset/password_change/">Security</a>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="logout-action">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn-pill">Sign In</Link>
          )}

          {/* Hamburger for Mobile */}
          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}