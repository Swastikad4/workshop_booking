import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function WorkshopDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const res = await api.get(`/workshops/${id}/`);
      setData(res.data);
    } catch { addToast('Failed to load workshop details', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/workshops/${id}/comment/`, { comment, public: isPublic });
      addToast('Comment posted', 'success');
      setComment('');
      fetchData();
    } catch { addToast('Failed to post comment', 'error'); }
  };

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;
  if (!data) return <div className="page-content"><div className="container"><p>Workshop not found</p></div></div>;

  const { workshop: w, comments, is_instructor } = data;

  return (
    <div className="page-content">
      <div className="container" style={{maxWidth:800}}>
        <div className="page-header animate-fade-in">
          <h1 className="page-title">Workshop Details</h1>
        </div>

        <div className="section-card animate-fade-in-up">
          <table className="data-table">
            <tbody>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)',width:'40%'}}>Workshop Type</td>
                <td><Link to={`/workshop-types/${w.workshop_type_id}`}>{w.workshop_type_name}</Link></td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Date</td>
                <td>{new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Coordinator</td>
                <td>{w.coordinator_name}</td></tr>
              <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Status</td>
                <td><span className={`badge ${w.status===1?'badge-success':'badge-warning'}`}>{w.status_display}</span></td></tr>
              {w.instructor_name && (
                <tr><td style={{fontWeight:600,color:'var(--text-muted)'}}>Instructor</td>
                  <td>{w.instructor_name}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="section-card animate-fade-in-up" style={{animationDelay:'0.1s'}}>
          <div className="section-title">Post a Comment</div>
          <form onSubmit={handleComment}>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
              {is_instructor && (
                <label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.85rem',color:'var(--text-secondary)'}}>
                  <input type="checkbox" className="form-checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  Public
                </label>
              )}
              {is_instructor && !isPublic && (
                <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>(Non-public comments visible only to instructors)</span>
              )}
            </div>
            <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..." rows={3} />
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
              <button type="submit" className="btn btn-primary">Post</button>
            </div>
          </form>
        </div>

        <div className="section-card animate-fade-in-up" style={{animationDelay:'0.2s'}}>
          <div className="section-title">Comments ({comments.length})</div>
          {comments.length === 0 ? (
            <p style={{color:'var(--text-muted)'}}>No comments yet</p>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{padding:'16px 0',borderBottom:'1px solid var(--border-color)'}}>
                <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
                  <span style={{fontWeight:600,color:'var(--accent-secondary)',fontSize:'0.9rem'}}>{c.author_name}</span>
                  {!c.public && <span className="badge badge-danger" style={{fontSize:'0.65rem'}}>Hidden</span>}
                  <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{new Date(c.created_date).toLocaleString()}</span>
                </div>
                <p style={{color:'var(--text-secondary)',fontSize:'0.9rem',lineHeight:1.6}}>{c.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
