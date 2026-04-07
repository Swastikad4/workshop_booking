import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function ProposeWorkshopPage() {
  const [types, setTypes] = useState([]);
  const [workshopType, setWorkshopType] = useState('');
  const [date, setDate] = useState('');
  const [tncAccepted, setTncAccepted] = useState(false);
  const [tnc, setTnc] = useState('');
  const [showTnc, setShowTnc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/workshop-types/').then(res => {
      setTypes(res.data.results || []);
    });
  }, []);

  const loadTnc = async () => {
    if (!workshopType) {
      setTnc('Please select a workshop type first.');
    } else {
      try {
        const res = await api.get(`/workshop-types/${workshopType}/tnc/`);
        setTnc(res.data.tnc);
      } catch { setTnc('Could not load terms.'); }
    }
    setShowTnc(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tncAccepted) { addToast('Please accept the terms and conditions', 'warning'); return; }
    setLoading(true);
    setErrors('');
    try {
      await api.post('/workshops/propose/', { workshop_type: workshopType, date, tnc_accepted: true });
      addToast('Workshop proposed successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.response?.data?.error || 'Failed to propose workshop');
    } finally { setLoading(false); }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <div className="page-content">
      <div className="container" style={{maxWidth:560}}>
        <div className="alert alert-info animate-fade-in">
          Note: Before proposing the workshop, please check about the workshop in the <strong>Workshop Types</strong> section.
        </div>

        <div className="section-card animate-fade-in-up" style={{marginTop:24}}>
          <div className="section-title">Propose Workshop</div>
          {errors && <div className="alert alert-error">{errors}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Workshop Type</label>
              <select className="form-select" value={workshopType} onChange={e => setWorkshopType(e.target.value)} required>
                <option value="">Select a workshop type</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Date</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate.toISOString().split('T')[0]}
                required />
            </div>
            <div className="form-group" style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="checkbox" className="form-checkbox" checked={tncAccepted} onChange={e => setTncAccepted(e.target.checked)} id="tnc" />
              <label htmlFor="tnc" style={{fontSize:'0.9rem',color:'var(--text-secondary)',cursor:'pointer'}}>
                I accept the <a href="#" onClick={e => { e.preventDefault(); loadTnc(); }}>terms and conditions</a>
              </label>
            </div>
            <button type="submit" className="btn btn-success btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>

        {showTnc && (
          <div className="modal-overlay" onClick={() => setShowTnc(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Terms and Conditions</h3>
                <button className="modal-close" onClick={() => setShowTnc(false)}>×</button>
              </div>
              <div style={{color:'var(--text-secondary)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{tnc}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
