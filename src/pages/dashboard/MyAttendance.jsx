import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Calendar, CheckCircle, X, AlertTriangle, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './StudentDashboard.css';

export default function MyAttendance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('ams_theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/attendance/student/${user._id}`);
        
        // Sort by date descending (newest first)
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to fetch attendance');
        setLoading(false);
      }
    };
    
    if (user) fetchAttendance();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const totalDays = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = attendance.filter(r => r.status === 'absent').length;
  const lateCount = attendance.filter(r => r.status === 'late').length;
  const percentage = totalDays > 0 ? (((presentCount + lateCount) / totalDays) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading attendance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
      <nav className="sd-navbar">
        <div className="sd-nav-brand">
          <div className="sd-logo-circle"></div>
          <span className="sd-brand-text">AMS</span>
        </div>
        <div className="sd-nav-links">
          <a onClick={() => navigate('/student-dashboard')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <BookOpen size={18} /> Dashboard
          </a>
          <a onClick={() => navigate('/my-courses')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <BookOpen size={18} /> My Courses
          </a>
          <a className="sd-nav-link active" style={{cursor:'pointer'}}>
            <Calendar size={18} /> My Attendance
          </a>
        
<a onClick={() => navigate('/report')} className="sd-nav-link" style={{cursor:'pointer'}}>
  <FileText size={18} /> Report
</a>
          <a onClick={() => navigate('/download')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <Download size={18} /> Download
          </a>
        </div>
        <div className="sd-nav-right">
          <div className="sd-theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '🌙'}</div>
          <div className="sd-profile-icon">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
          <button onClick={handleLogout} className="sd-logout-btn"><ArrowLeft size={18} /></button>
        </div>
      </nav>

      <main className="sd-main-content">
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h1 className="sd-welcome-title">My Attendance</h1>
          <p style={{ color: '#8b949e', marginTop: '8px' }}>View your attendance history and statistics</p>
        </div>

        <div className="sd-stats-grid" style={{ marginBottom: '30px' }}>
          <div className="sd-stat-card">
            <div className="sd-stat-icon blue"><Calendar size={24} /></div>
            <div className="sd-stat-info"><p>Total Days</p><h3>{totalDays}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon green"><CheckCircle size={24} /></div>
            <div className="sd-stat-info"><p>Present</p><h3>{presentCount}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon red"><X size={24} /></div>
            <div className="sd-stat-info"><p>Absent</p><h3>{absentCount}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon dark-green" style={{ background: percentage >= 75 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: percentage >= 75 ? '#10b981' : '#ef4444' }}>
              {percentage >= 75 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="sd-stat-info">
              <p>Attendance %</p>
              <h3 style={{ color: percentage >= 75 ? '#10b981' : '#ef4444' }}>{percentage}%</h3>
            </div>
          </div>
        </div>

        <div className="sd-chart-card">
          <h3>Attendance History</h3>
          <div style={{ overflowX: 'auto' }}>
            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
                <p>No attendance records found.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Subject</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #30363d' }}>
                      <td style={{ padding: '12px', color: '#c9d1d9' }}>
                        {new Date(record.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td style={{ padding: '12px', color: '#c9d1d9' }}>
                        {new Date(record.createdAt).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </td>
                      <td style={{ padding: '12px', color: '#c9d1d9' }}>
                        {record.subject?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: record.status === 'present' ? '#10b98120' : 
                                     record.status === 'absent' ? '#ef444420' : '#f59e0b20',
                          color: record.status === 'present' ? '#10b981' : 
                                 record.status === 'absent' ? '#ef4444' : '#f59e0b'
                        }}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#c9d1d9' }}>
                        {record.markedBy?.name || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
