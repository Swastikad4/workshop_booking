import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SEO from '../components/SEO';
import './PublicStatsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PublicStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from_date:'', to_date:'', workshop_type:'', state:'', sort:'date' });
  const [chartType, setChartType] = useState(null); // 'state' or 'type'
  const { user } = useAuth();

  const fetchStats = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.entries({ ...filters, ...params }).forEach(([k,v]) => { if(v) query.set(k,v); });
      const res = await api.get(`/statistics/public/?${query.toString()}`);
      setData(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleClear = () => {
    setFilters({ from_date:'', to_date:'', workshop_type:'', state:'', sort:'date' });
    fetchStats({ from_date:'', to_date:'', workshop_type:'', state:'', sort:'date' });
  };

  const chartData = chartType === 'state' ? {
    labels: data?.ws_states || [],
    datasets: [{ label: 'State wise workshops', data: data?.ws_count || [],
      backgroundColor: 'rgba(108, 99, 255, 0.7)', borderColor: '#6C63FF', borderWidth: 1, borderRadius: 6 }]
  } : {
    labels: data?.ws_type || [],
    datasets: [{ label: 'Type wise workshops', data: data?.ws_type_count || [],
      backgroundColor: 'rgba(0, 210, 255, 0.7)', borderColor: '#00D2FF', borderWidth: 1, borderRadius: 6 }]
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#A7A9BE' } } },
    scales: {
      x: { ticks: { color: '#A7A9BE' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#A7A9BE' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  return (
    <div className="page-content">
      <SEO 
        title="Impact Statistics" 
        description="Explore the reach and impact of FOSSEE Workshops across India. Visualize data by state, workshop type, and timeline."
      />
      <div className="container-fluid" style={{maxWidth:1400,margin:'0 auto',padding:'0 24px'}}>
        <div className="stats-layout">
          {/* Filter Sidebar */}
          <aside className="stats-sidebar">
            <div className="section-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)'}}>Filters</h3>
                <button className="btn btn-secondary btn-sm" onClick={handleClear}>✕ Clear</button>
              </div>
              <form onSubmit={handleFilter}>
                <div className="form-group">
                  <label className="form-label">From date</label>
                  <input type="date" className="form-input" value={filters.from_date}
                    onChange={e => setFilters(f => ({...f, from_date:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">To date</label>
                  <input type="date" className="form-input" value={filters.to_date}
                    onChange={e => setFilters(f => ({...f, to_date:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Workshop</label>
                  <select className="form-select" value={filters.workshop_type}
                    onChange={e => setFilters(f => ({...f, workshop_type:e.target.value}))}>
                    <option value="">---------</option>
                    {(data?.workshop_type_choices || []).map(([id,name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select className="form-select" value={filters.state}
                    onChange={e => setFilters(f => ({...f, state:e.target.value}))}>
                    <option value="">---------</option>
                    {(data?.state_choices || []).map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sort by</label>
                  <select className="form-select" value={filters.sort}
                    onChange={e => setFilters(f => ({...f, sort:e.target.value}))}>
                    <option value="date">Oldest</option>
                    <option value="-date">Latest</option>
                  </select>
                </div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button type="submit" className="btn btn-success">👁 View</button>
                  <button type="button" className="btn btn-primary"
                    onClick={() => {
                      const q = new URLSearchParams(filters);
                      q.set('download','download');
                      window.open(`http://127.0.0.1:8000/statistics/public?${q.toString()}`);
                    }}>📥 Download</button>
                </div>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main className="stats-main">
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{flex:1}} />
              <button className="btn btn-primary btn-sm" onClick={() => setChartType(chartType==='state'?null:'state')}>
                📊 State chart
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setChartType(chartType==='type'?null:'type')}>
                📊 Workshops chart
              </button>
            </div>

            {chartType && (
              <div className="section-card animate-fade-in" style={{marginBottom:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div className="section-title" style={{marginBottom:0}}>
                    {chartType === 'state' ? 'State Wise Workshops' : 'Type Wise Workshops'}
                  </div>
                  <button className="modal-close" onClick={() => setChartType(null)}>×</button>
                </div>
                <div style={{maxHeight:400}}>
                  <Bar data={chartData} options={chartOpts} />
                </div>
              </div>
            )}

            {loading ? <div className="loading-spinner" /> : (
              <div className="section-card animate-fade-in-up">
                <table className="data-table">
                  <thead><tr>
                    <th>Sr No.</th><th>Coordinator</th><th>Institute</th>
                    <th>Instructor</th><th>Workshop</th><th>Date</th>
                  </tr></thead>
                  <tbody>
                    {(data?.workshops || []).length === 0 ? (
                      <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No workshops found</td></tr>
                    ) : data.workshops.map((w, i) => (
                      <tr key={w.id}>
                        <td>{(data.page - 1) * data.page_size + i + 1}</td>
                        <td>{w.coordinator_name}</td>
                        <td>{w.coordinator_institute}</td>
                        <td>{w.instructor_name}</td>
                        <td>{w.workshop_type_name}</td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data && data.num_pages > 1 && (
                  <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
                    <button className="btn btn-secondary btn-sm" disabled={data.page<=1}
                      onClick={() => fetchStats({page:data.page-1})}>Previous</button>
                    <span style={{padding:'6px 12px',color:'var(--text-muted)',fontSize:'0.85rem'}}>
                      Page {data.page} of {data.num_pages}
                    </span>
                    <button className="btn btn-secondary btn-sm" disabled={data.page>=data.num_pages}
                      onClick={() => fetchStats({page:data.page+1})}>Next</button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
