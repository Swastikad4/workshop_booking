import { Link } from 'react-router-dom';

export default function LogoutPage() {
  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="section-card animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👋</div>
          <h2 style={{ marginBottom: 12 }}>You have logged out successfully</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            If you want to login again please click below.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">Sign In Again</Link>
        </div>
      </div>
    </div>
  );
}
