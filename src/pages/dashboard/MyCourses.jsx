import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Calendar, User, Clock, Download, CalendarDays, FileText, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './StudentDashboard.css';

export default function MyCourses() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allSubjects, setAllSubjects] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ams_theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const batch = user?.batch || 'General';
        
        // Fetch both attendance and subjects
        const [attRes, subRes] = await Promise.all([
          api.get(`/attendance/student/${user._id}`),
          api.get('/subjects')
        ]);
        
        const data = attRes.data;
        const subjects = subRes.data;
        
        // Filter subjects that have attendance data
        const attendedSubjectIds = new Set(data.map(r => r.subject?._id).filter(Boolean));
        const filteredSubjects = subjects.filter(s => attendedSubjectIds.has(s._id));
        setAllSubjects(filteredSubjects);
        
        // Aggregate Course-Wise Data
        const courseMap = {};
        data.forEach(record => {
          const sub = record.subject;
          if (!sub) return;
          
          if (!courseMap[sub._id]) {
            courseMap[sub._id] = {
              name: `${sub.name}${sub.code ? ` (${sub.code})` : ''}`,
              type: sub.type,
              present: 0,
              total: 0
            };
          }
          
          courseMap[sub._id].total++;
          if (record.status === 'present' || record.status === 'late') {
            courseMap[sub._id].present++;
          }
        });

        const processedCourseData = Object.values(courseMap).map(course => ({
          ...course,
          percent: course.total > 0 ? (course.present / course.total) * 100 : 0
        }));
        setCourseData(processedCourseData);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch courses');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate stats
  const totalCourses = allSubjects.length;
  const totalClasses = courseData.reduce((sum, course) => sum + course.total, 0);
  const overallAttendance = totalClasses > 0 ? 
    (courseData.reduce((sum, course) => sum + course.present, 0) / totalClasses * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
      {/* Top Navbar */}
      <nav className="sd-navbar">
        <div className="sd-nav-brand">
          <div className="sd-logo-circle"></div>
          <span className="sd-brand-text">AMS</span>
        </div>
        
        <div className="sd-nav-links">
          <a href="#" onClick={() => navigate('/student-dashboard')} className="sd-nav-link">
            <BookOpen size={18} /> Dashboard
          </a>
          <a href="#" className="sd-nav-link active">
            <BookOpen size={18} /> My Courses
          </a>
         <a onClick={(e) => { e.preventDefault(); navigate('/my-attendance'); }} className="sd-nav-link" style={{cursor:'pointer'}}>
  <Download size={18} /> My Attendance
</a>
       <a className="sd-nav-link " style={{cursor:'pointer'}}>
            <FileText size={18} /> Report
          </a>
          <a onClick={() => navigate('/download')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <Download size={18} /> Download
          </a>
        </div>
        <div className="sd-nav-right">
          <div className="sd-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀' : '🌙'}
          </div>
          <div className="sd-profile-icon">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
          <button onClick={handleLogout} className="sd-logout-btn" title="Logout">
            <ArrowLeft size={18} />
          </button>
        </div>
      </nav>

      <main className="sd-main-content">
        {/* Header */}
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h1 className="sd-welcome-title">My Courses</h1>
          <p style={{ color: '#8b949e', marginTop: '8px' }}>
            View all your enrolled courses and attendance records
          </p>
        </div>

        {/* Summary Cards */}
        <div className="sd-stats-grid" style={{ marginBottom: '30px' }}>
          <div className="sd-stat-card">
            <div className="sd-stat-icon blue"><BookOpen size={24} /></div>
            <div className="sd-stat-info">
              <p>Total Courses</p>
              <h3>{totalCourses}</h3>
            </div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon purple"><Clock size={24} /></div>
            <div className="sd-stat-info">
              <p>Total Classes</p>
              <h3>{totalClasses}</h3>
            </div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon green" style={{ background: overallAttendance >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: overallAttendance >= 75 ? '#10b981' : '#ef4444' }}>
              <BookOpen size={24} />
            </div>
            <div className="sd-stat-info">
              <p>Overall Attendance</p>
              <h3 style={{ color: overallAttendance >= 75 ? '#10b981' : '#ef4444' }}>
                {overallAttendance}%
              </h3>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="sd-courses-grid">
          {allSubjects.length > 0 ? (
            allSubjects.map(sub => {
              // Find attendance stats for this specific subject
              const stat = courseData.find(c => c.name.includes(sub.name)) || { percent: 0, present: 0, total: 0 };
              const percent = stat.percent;
              const isDanger = percent > 0 && percent < 75;

              return (
                <div key={sub._id} className="sd-course-card">
                  <div className="sd-course-header">
                    <div>
                      {sub.code && <p className="sd-course-code">{sub.code}</p>}
                      <h3 className="sd-course-title" title={sub.name}>{sub.name}</h3>
                    </div>
                    <span className="sd-course-type" style={{ background: sub.type === 'LAB' ? '#8b5cf6' : '#3b82f6' }}>
                      {sub.type}
                    </span>
                  </div>

                  <div className="sd-course-progress">
                    <div className="sd-progress-labels">
                      <span>Attendance</span>
                      <span className={`sd-progress-percent ${isDanger ? 'danger' : ''}`}>
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="sd-progress-bar-bg">
                      <div 
                        className={`sd-progress-bar-fill ${isDanger ? 'danger-bg' : ''}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="sd-course-footer">
                    <span className="sd-sem">Classes Attended: {stat.present}/{stat.total > 0 ? stat.total : '-'}</span>
                    <span style={{ color: '#fff' }}>Faculty: {sub.teacher?.name || 'N/A'}</span>
                  </div>

                </div>
              );
            })
           ) : (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: '40px 0' }}>
              No courses found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
