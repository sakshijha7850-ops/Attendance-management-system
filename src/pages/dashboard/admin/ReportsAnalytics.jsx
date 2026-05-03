import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  'Computer Science','Info Tech','Electronics','Electrical',
  'Mechanical','Civil','IoT','AI&DS','General'
];
const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('weekly');
  const [batch, setBatch] = useState('all');

  useEffect(() => { fetchReport(); }, [type, batch]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { type };
      if (batch !== 'all') params.batch = batch;
      const { data } = await api.get('/admin/reports', { params });
      setReport(data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const params = { batch: batch !== 'all' ? batch : undefined };
      const resp = await api.get('/admin/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `attendance_report.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const pieData = report ? [
    { name: 'Present', value: report.summary.totalPresent },
    { name: 'Absent', value: report.summary.totalAbsent },
    { name: 'Late', value: report.summary.totalLate },
  ].filter(d => d.value > 0) : [];

  return (
    <>
      <div className="admin-page-header">
        <h1>📈 Reports & Analytics</h1>
        <p>Attendance trends, batch-wise analysis, and export</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <select className="admin-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select className="admin-select" value={batch} onChange={e => setBatch(e.target.value)}>
              <option value="all">All Batches</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchReport}><RefreshCw size={14} /> Refresh</button>
          </div>
          <button className="admin-btn admin-btn-success" onClick={handleExport}><Download size={16} /> Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : !report ? (
        <div className="admin-empty"><p>No data available</p></div>
      ) : (
        <>
          <div className="admin-stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
            <div className="admin-stat-card green">
              <div className="admin-stat-info"><p>Total Records</p><h3>{report.summary.totalRecords}</h3></div>
            </div>
            <div className="admin-stat-card green">
              <div className="admin-stat-info"><p>Total Present</p><h3>{report.summary.totalPresent}</h3></div>
            </div>
            <div className="admin-stat-card red">
              <div className="admin-stat-info"><p>Total Absent</p><h3>{report.summary.totalAbsent}</h3></div>
            </div>
            <div className="admin-stat-card amber">
              <div className="admin-stat-info"><p>Total Late</p><h3>{report.summary.totalLate}</h3></div>
            </div>
          </div>

          <div className="admin-two-col">
            <div className="admin-card">
              <div className="admin-card-header"><h3>📊 Daily Trend ({type})</h3></div>
              <div className="admin-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.dailyData}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1a2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4,4,0,0]} name="Absent" />
                    <Bar dataKey="late" fill="#f59e0b" radius={[4,4,0,0]} name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header"><h3>🥧 Attendance Distribution</h3></div>
              <div className="admin-chart-container">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="admin-empty"><p>No data</p></div>
                )}
              </div>
            </div>
          </div>

          {report.batchBreakdown.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header"><h3>🏫 Batch-wise Breakdown</h3></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Batch</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead>
                  <tbody>
                    {report.batchBreakdown.map(b => {
                      const total = (b.present||0) + (b.absent||0) + (b.late||0);
                      const pct = total > 0 ? ((b.present||0)/total*100).toFixed(1) : '0';
                      return (
                        <tr key={b.batch}>
                          <td style={{fontWeight:600,color:'#fff'}}>{b.batch}</td>
                          <td><span className="admin-badge admin-badge-present">{b.present||0}</span></td>
                          <td><span className="admin-badge admin-badge-absent">{b.absent||0}</span></td>
                          <td><span className="admin-badge admin-badge-late">{b.late||0}</span></td>
                          <td style={{color: pct >= 75 ? '#10b981' : '#ef4444', fontWeight:700}}>{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
