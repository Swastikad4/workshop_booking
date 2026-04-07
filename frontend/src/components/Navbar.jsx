import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? '/dashboard' : '/login'} className="navbar-brand">
          FOSSEE <span>Workshops</span>
        </Link>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>

        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/statistics" onClick={() => setMobileOpen(false)}>
              Workshop Statistics
            </NavLink>
          </li>
          {user && (
            <>
              {user.is_instructor && (
                <li>
                  <NavLink to="/statistics/team" onClick={() => setMobileOpen(false)}>
                    Team Statistics
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                  Workshop Status
                </NavLink>
              </li>
              {!user.is_instructor && (
                <li>
                  <NavLink to="/propose-workshop" onClick={() => setMobileOpen(false)}>
                    Propose Workshop
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/workshop-types" onClick={() => setMobileOpen(false)}>
                  Workshop Types
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-right">
          {user && (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="navbar-user-icon">{getInitials()}</span>
                {user.full_name || user.username}
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                  <a href="http://127.0.0.1:8000/reset/password_change/"
                     onClick={() => setDropdownOpen(false)}>
                    Change Password
                  </a>
                  <div className="navbar-dropdown-divider" />
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
