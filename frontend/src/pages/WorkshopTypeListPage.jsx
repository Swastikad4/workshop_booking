import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function WorkshopTypeListPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/workshop-types/?page=${page}`).then(res => {
      setTypes(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header animate-fade-in" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h1 className="page-title">Workshop Types</h1>
            <p className="page-subtitle">Browse available workshop types</p>
          </div>
          {user?.is_instructor && (
            <Link to="/workshop-types/add" className="btn btn-primary">
              + Add Workshop Type
            </Link>
          )}
        </div>

        <div className="section-card animate-fade-in-up">
          {types.length === 0 ? (
            <div className="empty-state"><h3>No workshop types found</h3></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Sr No</th><th>Workshop Name</th><th>Duration (Days)</th><th>Action</th>
              </tr></thead>
              <tbody>
                {types.map((t, i) => (
                  <tr key={t.id}>
                    <td>{(page - 1) * 12 + i + 1}</td>
                    <td style={{fontWeight:500}}>{t.name}</td>
                    <td>{t.duration}</td>
                    <td>
                      <Link to={`/workshop-types/${t.id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
              <button className="btn btn-secondary btn-sm" disabled={page<=1} onClick={() => setPage(p => p-1)}>Previous</button>
              <span style={{padding:'6px 12px',color:'var(--text-muted)',fontSize:'0.85rem'}}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page>=totalPages} onClick={() => setPage(p => p+1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
