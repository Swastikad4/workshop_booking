import { Link } from 'react-router-dom';

export default function ActivationPage() {
  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="section-card animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>Activation Awaiting</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            The activation link has been sent to your email. The link expires in <strong>24 hours</strong> from the date of registration.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
