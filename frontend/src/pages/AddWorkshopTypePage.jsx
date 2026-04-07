import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';

export default function AddWorkshopTypePage() {
  const [form, setForm] = useState({ name:'', description:'', duration:'', terms_and_conditions:'' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/workshop-types/add/', form);
      addToast('Workshop Type added!', 'success');
      navigate(`/workshop-types/${res.data.id}`);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="container" style={{maxWidth:700}}>
        <div className="page-header animate-fade-in"><h1 className="page-title">New Workshop Type</h1></div>
        <div className="section-card animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Workshop Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (days)</label>
              <input type="number" min="1" className="form-input" value={form.duration} onChange={e => setForm(f => ({...f, duration:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} required rows={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Terms and Conditions</label>
              <textarea className="form-textarea" value={form.terms_and_conditions} onChange={e => setForm(f => ({...f, terms_and_conditions:e.target.value}))} required rows={5} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
