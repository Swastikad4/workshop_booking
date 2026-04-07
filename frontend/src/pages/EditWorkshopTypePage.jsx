import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';

export default function EditWorkshopTypePage() {
  const { id } = useParams();
  const [form, setForm] = useState({ name:'', description:'', duration:'', terms_and_conditions:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/workshop-types/${id}/`).then(res => {
      setForm({ name:res.data.name, description:res.data.description, duration:res.data.duration, terms_and_conditions:res.data.terms_and_conditions });
      setLoading(false);
    }).catch(() => { setLoading(false); addToast('Not found','error'); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/workshop-types/${id}/edit/`, form);
      addToast('Workshop type saved!', 'success');
      navigate(`/workshop-types/${id}`);
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container" style={{maxWidth:700}}>
        <div className="page-header animate-fade-in"><h1 className="page-title">Edit Workshop Type</h1></div>
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
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
