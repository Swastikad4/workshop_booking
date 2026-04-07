import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';

export default function ViewProfilePage() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    api.get(`/profile/${userId}/`).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => { setLoading(false); addToast('Could not load profile', 'error'); });
  }, [userId]);

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;
  if (!data) return <div className="page-content"><div className="container"><p>Profile not available</p></div></div>;

  const p = data.profile;
  const ws = data.workshops;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header animate-fade-in">
          <h1 className="page-title">Coordinator Profile</h1>
        </div>

        <div className="section-card animate-fade-in-up">
          <table className="data-table">
            <tbody>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)',width:'35%'}}>First Name</td><td>{p.first_name}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Last Name</td><td>{p.last_name}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Email</td><td>{p.email}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Institute</td><td>{p.profile?.institute}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Phone</td><td>{p.profile?.phone_number}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Department</td><td>{p.profile?.department}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Location</td><td>{p.profile?.location}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Position</td><td>{p.profile?.position}</td></tr>
            </tbody>
          </table>
        </div>

        {ws && ws.length > 0 && (
          <div className="section-card animate-fade-in-up" style={{animationDelay:'0.1s'}}>
            <div className="section-title">Workshop Details</div>
            <table className="data-table">
              <thead><tr><th>Instructor</th><th>Date</th><th>Type</th></tr></thead>
              <tbody>
                {ws.map(w => (
                  <tr key={w.id}>
                    <td>{w.instructor_name || <span className="badge badge-warning">Pending</span>}</td>
                    <td>{new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td>{w.workshop_type_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
