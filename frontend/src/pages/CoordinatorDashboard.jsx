import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './DashboardPage.css';

export default function CoordinatorDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const res = await api.get('/workshops/status/coordinator/');
      setWorkshops(res.data);
    } catch (err) {
      addToast('Failed to load workshops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const accepted = workshops.filter(w => w.status === 1);
  const pending = workshops.filter(w => w.status === 0 && w.tnc_accepted);

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        {workshops.length === 0 ? (
          <div className="welcome-card glass-card animate-fade-in-up">
            <h1>Welcome, {user?.first_name} 👋</h1>
            <p>Information related to your workshops will be shown here. You can propose a workshop as per your available date in the <strong>Propose Workshop</strong> tab.</p>
            <Link to="/propose-workshop" className="btn btn-primary" style={{marginTop: 16}}>
              Propose a Workshop
            </Link>
          </div>
        ) : (
          <>
            <div className="page-header animate-fade-in">
              <h1 className="page-title">My Workshops</h1>
              <p className="page-subtitle">Track the status of your proposed workshops</p>
            </div>

            <div className="section-card animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="section-title">
                <span className="badge badge-success">✓</span> Workshops Accepted
              </div>
              {accepted.length === 0 ? (
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>No accepted workshops yet</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Workshop Name</th>
                      <th>Instructor</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accepted.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/workshop/${w.id}`}>{w.workshop_type_name}</Link></td>
                        <td>{w.instructor_name || '—'}</td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><span className="badge badge-success">{w.status_display}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="section-card animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="section-title">
                <span className="badge badge-warning">⏳</span> Workshops Proposed By Me
              </div>
              {pending.length === 0 ? (
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>No pending proposals</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Workshop Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/workshop/${w.id}`}>{w.workshop_type_name}</Link></td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><span className="badge badge-warning">{w.status_display}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
