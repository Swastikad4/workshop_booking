import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import SEO from '../components/SEO';
import './RegisterPage.css';

const DEPARTMENT_CHOICES = [
  ['computer engineering', 'Computer Science'],
  ['information technology', 'Information Technology'],
  ['civil engineering', 'Civil Engineering'],
  ['electrical engineering', 'Electrical Engineering'],
  ['mechanical engineering', 'Mechanical Engineering'],
  ['chemical engineering', 'Chemical Engineering'],
  ['aerospace engineering', 'Aerospace Engineering'],
  ['biosciences and bioengineering', 'Biosciences and BioEngineering'],
  ['electronics', 'Electronics'],
  ['energy science and engineering', 'Energy Science and Engineering'],
];

const TITLE_CHOICES = [
  ['Professor', 'Prof.'], ['Doctor', 'Dr.'], ['Shriman', 'Shri'],
  ['Shrimati', 'Smt'], ['Kumari', 'Ku'], ['Mr', 'Mr.'],
  ['Mrs', 'Mrs.'], ['Miss', 'Ms.'],
];

const SOURCE_CHOICES = [
  ['FOSSEE website', 'FOSSEE website'], ['Google', 'Google'],
  ['Social Media', 'Social Media'], ['From other College', 'From other College'],
];

const STATE_CHOICES = [
  ['IN-AP','Andhra Pradesh'],['IN-AR','Arunachal Pradesh'],['IN-AS','Assam'],
  ['IN-BR','Bihar'],['IN-CT','Chhattisgarh'],['IN-GA','Goa'],
  ['IN-GJ','Gujarat'],['IN-HR','Haryana'],['IN-HP','Himachal Pradesh'],
  ['IN-JK','Jammu and Kashmir'],['IN-JH','Jharkhand'],['IN-KA','Karnataka'],
  ['IN-KL','Kerala'],['IN-MP','Madhya Pradesh'],['IN-MH','Maharashtra'],
  ['IN-MN','Manipur'],['IN-ML','Meghalaya'],['IN-MZ','Mizoram'],
  ['IN-NL','Nagaland'],['IN-OR','Odisha'],['IN-PB','Punjab'],
  ['IN-RJ','Rajasthan'],['IN-SK','Sikkim'],['IN-TN','Tamil Nadu'],
  ['IN-TG','Telangana'],['IN-TR','Tripura'],['IN-UT','Uttarakhand'],
  ['IN-UP','Uttar Pradesh'],['IN-WB','West Bengal'],
  ['IN-AN','Andaman and Nicobar Islands'],['IN-CH','Chandigarh'],
  ['IN-DN','Dadra and Nagar Haveli'],['IN-DD','Daman and Diu'],
  ['IN-DL','Delhi'],['IN-LD','Lakshadweep'],['IN-PY','Puducherry'],
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm_password: '',
    title: 'Mr', first_name: '', last_name: '', phone_number: '',
    institute: '', department: 'computer engineering', location: '',
    state: 'IN-MH', how_did_you_hear_about_us: 'FOSSEE website',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await registerUser(form);
      addToast('Registration successful! Check your email for activation link.', 'success');
      navigate('/activation');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        addToast('Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, type = 'text', opts = {}) => (
    <div className="form-group" key={name}>
      <label className="form-label">{label} *</label>
      {opts.choices ? (
        <select name={name} className="form-select" value={form[name]} onChange={handleChange}>
          {opts.choices.map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      ) : (
        <input
          name={name} type={type} className="form-input"
          placeholder={opts.placeholder || label}
          value={form[name]} onChange={handleChange} required
        />
      )}
      {errors[name] && <div className="form-error">{errors[name].join(', ')}</div>}
    </div>
  );

  return (
    <div className="register-page">
      <SEO 
        title="Create Account" 
        description="Join FOSSEE Workshops at IIT Bombay. Register as a coordinator to facilitate workshops in your institution."
      />
      <div className="register-container animate-fade-in-up">
        <div className="register-card glass-card">
          <div className="register-header">
            <h1 className="register-title">Coordinator Registration</h1>
            <p className="register-subtitle">Create your FOSSEE Workshops account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="register-grid">
              {renderField('title', 'Title', 'text', { choices: TITLE_CHOICES })}
              {renderField('first_name', 'First Name')}
              {renderField('last_name', 'Last Name')}
              {renderField('username', 'Username')}
              {renderField('email', 'Email', 'email')}
              {renderField('password', 'Password', 'password')}
              {renderField('confirm_password', 'Confirm Password', 'password')}
              {renderField('phone_number', 'Phone Number', 'tel', { placeholder: '9999999999' })}
              {renderField('institute', 'Institute')}
              {renderField('department', 'Department', 'text', { choices: DEPARTMENT_CHOICES })}
              {renderField('location', 'Location (Place/City)')}
              {renderField('state', 'State', 'text', { choices: STATE_CHOICES })}
              {renderField('how_did_you_hear_about_us', 'How did you hear about us?', 'text', { choices: SOURCE_CHOICES })}
            </div>
            <button type="submit" className="btn btn-primary btn-lg register-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
