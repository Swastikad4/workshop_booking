import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(username, password);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arise-login-container">
      {/* Background Graphic Elements */}
      <div className="arise-graphics-layer">
        <div className="arise-circle-system">
          <div className="arise-huge-circle"></div>
          <div className="arise-outline-circle"></div>

          {/* Improved Floating Node Cards */}
          <div className="arise-node node-ml">
            <div className="node-icon">🎤</div>
            <div className="node-card">
              <h3>Voice Notes</h3>
              <p>Record and submit feedback instantly</p>
            </div>
          </div>

          <div className="arise-node node-bl">
            <div className="node-icon">📊</div>
            <div className="node-card">
              <h3>Analytics</h3>
              <p>Visualize workshop data with charts</p>
            </div>
          </div>

          <div className="arise-node node-mr">
            <div className="node-icon">👤</div>
            <div className="node-card">
              <h3>Profile</h3>
              <p>Manage your personal details</p>
            </div>
          </div>

          <div className="arise-node node-br">
            <div className="node-icon">📁</div>
            <div className="node-card">
              <h3>File Manager</h3>
              <p>Upload and organize resources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="arise-content">
        <div className="arise-title-section">
          <h1 className="arise-main-title">Welcome Back, Please Login to Get started</h1>
          <p className="arise-sub-title">Maybe some text here will help me see it better. Oh God. Oke, let's do it then.</p>
        </div>

        <div className="arise-card-container">
          <div className="arise-form-card">
            <div className="form-card-header">
              <h2>Get Started</h2>
              <p>Enter the information you entered while registering</p>
            </div>

            {error && <div className="arise-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="arise-input-group">
                <label>Username</label>
                <div className="arise-input-wrapper">
                  <div className="input-prefix-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="arise-input-group">
                <label>Password</label>
                <div className="arise-input-wrapper">
                  <div className="input-prefix-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="arise-form-options">
                <label className="arise-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="http://127.0.0.1:8000/reset/password_reset/" className="arise-forgot">Forgot password</a>
              </div>

              <button type="submit" className="arise-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="arise-social-login">
              <p>sign in to this account</p>
              <div className="arise-social-icons">
                <button type="button" className="arise-social-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="arise-page-footer">
              Need an account? <Link to="/register" style={{ color: 'var(--neon-lime)', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
