import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './DashboardPage.css';

export default function InstructorDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateModal, setDateModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => { fetchWorkshops(); }, []);

  const fetchWorkshops = async () => {
    try {
      const res = await api.get('/workshops/status/instructor/');
      setWorkshops(res.data.workshops);
      setToday(res.data.today);
    } catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const handleAccept = async (id) => {
    if (!window.confirm('Once accepted you cannot reject. Are you sure?')) return;
    try {
      await api.post(`/workshops/accept/${id}/`);
      addToast('Workshop accepted!', 'success');
      fetchWorkshops();
    } catch { addToast('Failed to accept', 'error'); }
  };

  const handleChangeDate = async (id) => {
    if (!newDate) return;
    try {
      await api.post(`/workshops/change-date/${id}/`, { new_date: newDate });
      addToast('Date updated', 'success');
      setDateModal(null);
      setNewDate('');
      fetchWorkshops();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed', 'error');
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
            <p>Your workshop related information will be shown here. Navigate to <strong>Workshop Types</strong> and depending on your expertise create or accept workshops.</p>
          </div>
        ) : (
          <>
            <div className="page-header animate-fade-in">
              <h1 className="page-title">Workshop Dashboard</h1>
              <p className="page-subtitle">Manage your accepted and incoming workshops</p>
            </div>

            <div className="section-card animate-fade-in-up" style={{animationDelay:'0.1s'}}>
              <div className="section-title">
                <span className="badge badge-success">✓</span> Workshops Accepted
              </div>
              {accepted.length === 0 ? (
                <p style={{color:'var(--text-muted)'}}>No accepted workshops</p>
              ) : (
                <table className="data-table">
                  <thead><tr>
                    <th>Coordinator</th><th>Institute</th><th>Workshop</th><th>Date</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {accepted.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/profile/${w.coordinator_id}`}>{w.coordinator_name}</Link></td>
                        <td>{w.coordinator_institute}</td>
                        <td>{w.workshop_type_name}</td>
                        <td>
                          {new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                          {w.date > today && (
                            <button className="btn btn-sm btn-outline" style={{marginLeft:8,padding:'2px 8px',fontSize:'0.7rem'}} onClick={() => { setDateModal(w.id); setNewDate(''); }}>
                              📅
                            </button>
                          )}
                        </td>
                        <td><span className="badge badge-success">{w.status_display}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="section-card animate-fade-in-up" style={{animationDelay:'0.2s'}}>
              <div className="section-title">
                <span className="badge badge-warning">⏳</span> Workshops Proposed By Coordinators
              </div>
              {pending.length === 0 ? (
                <p style={{color:'var(--text-muted)'}}>No pending proposals</p>
              ) : (
                <table className="data-table">
                  <thead><tr>
                    <th>Coordinator</th><th>Institute</th><th>Workshop</th><th>Date</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {pending.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/profile/${w.coordinator_id}`}>{w.coordinator_name}</Link></td>
                        <td>{w.coordinator_institute}</td>
                        <td>{w.workshop_type_name}</td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                        <td><span className="badge badge-warning">{w.status_display}</span></td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => handleAccept(w.id)}>
                            Accept
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {dateModal && (
          <div className="modal-overlay" onClick={() => setDateModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Change Workshop Date</h3>
                <button className="modal-close" onClick={() => setDateModal(null)}>×</button>
              </div>
              <div className="form-group">
                <label className="form-label">New Date</label>
                <input type="date" className="form-input" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
                <button className="btn btn-secondary" onClick={() => setDateModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleChangeDate(dateModal)}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
