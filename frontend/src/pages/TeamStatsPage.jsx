import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TeamStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);
  const { addToast } = useToast();

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const url = id ? `/statistics/team/${id}/` : '/statistics/team/';
      const res = await api.get(url);
      setData(res.data);
      setTeamId(res.data.team_id);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const chartData = {
    labels: data?.team_labels || [],
    datasets: [{
      label: 'Team Members Workshops',
      data: data?.ws_count || [],
      backgroundColor: 'rgba(108, 99, 255, 0.7)',
      borderColor: '#6C63FF',
      borderWidth: 1,
      borderRadius: 6,
    }]
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
      <div className="container-fluid" style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
        <div className="page-header animate-fade-in">
          <h1 className="page-title">Team Statistics</h1>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:24,alignItems:'start'}}>
          <div className="section-card animate-fade-in-up">
            <div className="section-title" style={{fontSize:'0.9rem'}}>Teams</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {(data?.all_teams || []).map(t => (
                <button key={t.id} className={`btn ${t.id===teamId ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{justifyContent:'flex-start'}} onClick={() => fetchData(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="section-card animate-fade-in-up" style={{animationDelay:'0.1s'}}>
            {loading ? <div className="loading-spinner" /> : (
              data ? <Bar data={chartData} options={chartOpts} /> :
              <div className="empty-state"><h3>No data available</h3></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
