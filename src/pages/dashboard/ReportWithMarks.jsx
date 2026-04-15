import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Calendar, CheckCircle, X, AlertTriangle, TrendingUp, TrendingDown, FileText, Users, Award, Plus, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './StudentDashboard.css';

export default function Report() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('ams_theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance data
        const attendanceResponse = await api.get(`/attendance/student/${user._id}`);
        const attendanceData = attendanceResponse.data || [];
        const sortedAttendance = attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(sortedAttendance);
        
        // Fetch marks data
        try {
          const marksResponse = await api.get(`/marks/student/${user._id}`);
          const marksData = marksResponse.data || [];
          setMarks(marksData);
          console.log('Marks data:', marksData);
        } catch (marksError) {
          console.log('No marks data found:', marksError);
          setMarks([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch report data');
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const totalDays = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = attendance.filter(r => r.status === 'absent').length;
  const lateCount = attendance.filter(r => r.status === 'late').length;
  const percentage = totalDays > 0 ? (((presentCount + lateCount) / totalDays) * 100).toFixed(1) : 0;

  // Calculate marks statistics
  const totalSubjects = [...new Set(marks.map(m => m.subject))].length;
  const averageMarks = marks.length > 0 
    ? (marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div>Loading report...</div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#8b949e' }}>
              User: {user?.name || 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
      <nav className="sd-navbar">
        <div className="sd-nav-brand">
          <div className="sd-logo-circle"></div>
          <span className="sd-logo-text">AMS</span>
        </div>
        
        <div className="sd-nav-links">
          <a onClick={() => navigate('/student-dashboard')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <BookOpen size={18} /> Dashboard
          </a>
          <a onClick={() => navigate('/my-courses')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <BookOpen size={18} /> My Courses
          </a>
          <a onClick={() => navigate('/my-attendance')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <Calendar size={18} /> My Attendance
          </a>
          <a className="sd-nav-link active" style={{cursor:'pointer'}}>
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
          <h1 className="sd-welcome-title">Academic Report</h1>
          <p style={{ color: '#8b949e', marginTop: '8px' }}>Your complete academic performance report</p>
        </div>

        {/* Attendance Statistics */}
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
              {percentage >= 75 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className="sd-stat-info"><p>Attendance %</p><h3 style={{ color: percentage >= 75 ? '#10b981' : '#ef4444' }}>{percentage}%</h3></div>
          </div>
        </div>

        {/* Marks Statistics */}
        <div className="sd-stats-grid" style={{ marginBottom: '30px' }}>
          <div className="sd-stat-card">
            <div className="sd-stat-icon purple"><Award size={24} /></div>
            <div className="sd-stat-info"><p>Total Subjects</p><h3>{totalSubjects}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon orange"><CheckCircle size={24} /></div>
            <div className="sd-stat-info"><p>Total Marks</p><h3>{marks.reduce((sum, m) => sum + m.marks, 0)}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon yellow"><TrendingUp size={24} /></div>
            <div className="sd-stat-info"><p>Average Marks</p><h3>{averageMarks}</h3></div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon green" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
              <FileText size={24} />
            </div>
            <div className="sd-stat-info"><p>Total Assessments</p><h3>{marks.length}</h3></div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="sd-chart-card" style={{ marginBottom: '30px' }}>
          <h3>Performance Summary</h3>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#8b949e' }}>Overall Performance</span>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '14px', 
                fontWeight: '600',
                background: percentage >= 75 && averageMarks >= 20 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: percentage >= 75 && averageMarks >= 15 ? '#10b981' : '#ef4444'
              }}>
                {percentage >= 75 && averageMarks >= 20 ? 'Excellent' : 
                 percentage >= 60 && averageMarks >= 15 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>Attendance Performance</div>
                <div style={{ width: '100%', height: '8px', background: '#30363d', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: percentage >= 75 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>{percentage}% attendance</div>
              </div>
              <div>
                <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>Academic Performance</div>
                <div style={{ width: '100%', height: '8px', background: '#30363d', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(averageMarks, 100)}%`, 
                    height: '100%', 
                    background: averageMarks >= 20 ? '#10b981' : averageMarks >= 15 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>{averageMarks}% average marks</div>
              </div>
            </div>
            <p style={{ color: '#8b949e', fontSize: '14px' }}>
              {percentage >= 75 && averageMarks >= 20 ? 'Excellent performance in both attendance and academics!' : 
               percentage >= 60 && averageMarks >= 15 ? 'Good performance, keep up the effort!' : 
               'Focus on improving both attendance and academic performance.'}
            </p>
          </div>
        </div>

        {/* Marks Details */}
        {marks.length > 0 && (
          <div className="sd-chart-card" style={{ marginBottom: '30px' }}>
            <h3>Marks Details</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Subject</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Marks</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((mark, index) => {
                    const grade = mark.marks >= 20 ? 'A+' : 
                                mark.marks >= 15 ? 'A' : 
                                mark.marks >= 10 ? 'B+' : 
                                mark.marks >= 5 ? 'C' : 
                                mark.marks >= 3 ? 'D' : 'F';

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #30363d' }}>
                        <td style={{ padding: '12px', color: '#c9d1d9' }}>{mark.subject}</td>
                        <td style={{ padding: '12px', color: mark.marks >= 20 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                          {mark.marks}
                        </td>
                        <td style={{ padding: '12px', color: '#8b949e' }}>
                          {new Date(mark.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: grade === 'A+' || grade === 'A' ? '#10b98120' : 
                                       grade === 'B+' || grade === 'B' ? '#f59e0b20' : '#ef444420',
                            color: grade === 'A+' || grade === 'A' ? '#10b981' : 
                                   grade === 'B+' || grade === 'B' ? '#f59e0b' : '#ef4444'
                          }}>
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Marks Message */}
        {marks.length === 0 && (
          <div className="sd-chart-card">
            <h3>Marks Information</h3>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Award size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ color: '#8b949e', marginBottom: '8px' }}>No marks data available</p>
              <p style={{ color: '#8b949e', fontSize: '14px' }}>
                Your marks will appear here once teachers assign them.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
