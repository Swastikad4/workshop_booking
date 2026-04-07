import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="section-card animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.5 }}>404</div>
          <h2 style={{ marginBottom: 12 }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
