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
  
  console.log('Report component loaded, user:', user);
  
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('ams_theme') || 'dark');
  const [showMarksSection, setShowMarksSection] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [marksLoading, setMarksLoading] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        console.log('Fetching attendance for user:', user);
        setLoading(true);
        const { data } = await api.get(`/attendance/student/${user._id}`);
        console.log('API Response:', data);
        
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sorted data:', sortedData);
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

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/users');
      const studentUsers = data.filter(u => u.role === 'student');
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const assignMarks = async () => {
    if (!selectedStudent || !subject || !marks) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setMarksLoading(true);
      await api.post('/marks/assign', {
        studentId: selectedStudent,
        subject,
        marks: parseFloat(marks)
      });
      toast.success('Marks assigned successfully!');
      setSelectedStudent('');
      setSubject('');
      setMarks('');
    } catch (error) {
      console.error('Error assigning marks:', error);
      toast.error('Failed to assign marks');
    } finally {
      setMarksLoading(false);
    }
  };

  const totalDays = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = attendance.filter(r => r.status === 'absent').length;
  const lateCount = attendance.filter(r => r.status === 'late').length;
  const attendedDays = presentCount + lateCount;
  const percentage = totalDays > 0 ? (((presentCount + lateCount) / totalDays) * 100).toFixed(1) : 0;

  if (loading) {
    console.log('Loading state:', loading);
    return (
      <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div>Loading report...</div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#8b949e' }}>
              User: {user?.name || 'Loading user...'}
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
          <button 
            onClick={() => {
              setShowMarksSection(!showMarksSection);
              if (!showMarksSection) fetchStudents();
            }} 
            className="sd-logout-btn" 
            style={{ marginRight: '10px', background: '#10b981' }}
            title="Assign Marks"
          >
            <Award size={18} />
          </button>
          <button onClick={handleLogout} className="sd-logout-btn" title="Logout"><ArrowLeft size={18} /></button>
        </div>
      </nav>

      <main className="sd-main-content">
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h1 className="sd-welcome-title">Attendance Report</h1>
          <p style={{ color: '#8b949e', marginTop: '8px' }}>Detailed analysis of your attendance performance</p>
        </div>

        {showMarksSection && (
          <div className="sd-chart-card" style={{ marginBottom: '30px' }}>
            <h3>Assign Marks to Students</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '14px' }}>Select Student</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Choose Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '14px' }}>Subject</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '14px' }}>Marks</label>
                <input 
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks (0-100)"
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={assignMarks}
                disabled={marksLoading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: marksLoading ? '#6c757d' : '#10b981',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: marksLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {marksLoading ? (
                  <div>Assigning...</div>
                ) : (
                  <>
                    <Save size={16} />
                    Assign Marks
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
                background: percentage >= 75 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: percentage >= 75 ? '#10b981' : '#ef4444'
              }}>
                {percentage >= 75 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#30363d', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                background: percentage >= 75 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ color: '#8b949e', fontSize: '14px', marginTop: '10px' }}>
              {percentage >= 75 ? 'Great job! Your attendance is excellent.' : 
               percentage >= 60 ? 'Good attendance! Keep it up.' : 
               'Your attendance needs improvement. Try to attend more classes.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
