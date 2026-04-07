import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const DEPT_CHOICES = [
  ['computer engineering','Computer Science'],['information technology','Information Technology'],
  ['civil engineering','Civil Engineering'],['electrical engineering','Electrical Engineering'],
  ['mechanical engineering','Mechanical Engineering'],['chemical engineering','Chemical Engineering'],
  ['aerospace engineering','Aerospace Engineering'],['biosciences and bioengineering','Biosciences and BioEngineering'],
  ['electronics','Electronics'],['energy science and engineering','Energy Science and Engineering'],
];
const TITLE_CHOICES = [
  ['Professor','Prof.'],['Doctor','Dr.'],['Shriman','Shri'],['Shrimati','Smt'],
  ['Kumari','Ku'],['Mr','Mr.'],['Mrs','Mrs.'],['Miss','Ms.'],
];
const STATE_CHOICES = [
  ['IN-AP','Andhra Pradesh'],['IN-AR','Arunachal Pradesh'],['IN-AS','Assam'],['IN-BR','Bihar'],
  ['IN-CT','Chhattisgarh'],['IN-GA','Goa'],['IN-GJ','Gujarat'],['IN-HR','Haryana'],
  ['IN-HP','Himachal Pradesh'],['IN-JK','Jammu and Kashmir'],['IN-JH','Jharkhand'],
  ['IN-KA','Karnataka'],['IN-KL','Kerala'],['IN-MP','Madhya Pradesh'],['IN-MH','Maharashtra'],
  ['IN-MN','Manipur'],['IN-ML','Meghalaya'],['IN-MZ','Mizoram'],['IN-NL','Nagaland'],
  ['IN-OR','Odisha'],['IN-PB','Punjab'],['IN-RJ','Rajasthan'],['IN-SK','Sikkim'],
  ['IN-TN','Tamil Nadu'],['IN-TG','Telangana'],['IN-TR','Tripura'],['IN-UT','Uttarakhand'],
  ['IN-UP','Uttar Pradesh'],['IN-WB','West Bengal'],['IN-AN','Andaman and Nicobar Islands'],
  ['IN-CH','Chandigarh'],['IN-DN','Dadra and Nagar Haveli'],['IN-DD','Daman and Diu'],
  ['IN-DL','Delhi'],['IN-LD','Lakshadweep'],['IN-PY','Puducherry'],
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const { fetchUser } = useAuth();

  useEffect(() => {
    api.get('/profile/').then(res => {
      setProfile(res.data);
      setForm({
        title: res.data.profile?.title || '',
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone_number: res.data.profile?.phone_number || '',
        institute: res.data.profile?.institute || '',
        department: res.data.profile?.department || '',
        position: res.data.profile?.position || '',
        location: res.data.profile?.location || '',
        state: res.data.profile?.state || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/', form);
      addToast('Profile updated!', 'success');
      fetchUser();
    } catch { addToast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-content"><div className="loading-spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-header animate-fade-in">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Update your personal information</p>
        </div>
        <div className="section-card animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <select className="form-select" name="title" value={form.title} onChange={handleChange}>
                  {TITLE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" name="phone_number" value={form.phone_number} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Institute</label>
                <input className="form-input" name="institute" value={form.institute} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                  {DEPT_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Position</label>
                <input className="form-input" name="position" value={form.position} onChange={handleChange} readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" name="state" value={form.state} onChange={handleChange}>
                  {STATE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="submit" className="btn btn-success btn-lg" disabled={saving}>
                {saving ? 'Updating...' : '✏️ Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
