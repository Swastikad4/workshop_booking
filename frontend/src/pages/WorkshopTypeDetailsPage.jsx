import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function WorkshopTypeDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/workshop-types/${id}/`).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;
  if (!data) return <div className="page-content"><div className="container"><p>Not found</p></div></div>;

  return (
    <div className="page-content">
      <div className="container" style={{maxWidth:800}}>
        <div className="page-header animate-fade-in" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 className="page-title">Workshop Details</h1>
          {user?.is_instructor && (
            <Link to={`/workshop-types/${id}/edit`} className="btn btn-primary btn-sm">Edit</Link>
          )}
        </div>
        <div className="section-card animate-fade-in-up">
          <table className="data-table">
            <tbody>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)',width:'30%'}}>Workshop Name</td><td>{data.name}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Duration</td><td>{data.duration} day(s)</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Description</td><td style={{whiteSpace:'pre-wrap'}}>{data.description}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Terms and Conditions</td><td style={{whiteSpace:'pre-wrap'}}>{data.terms_and_conditions}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
