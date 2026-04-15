import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BookOpen, Menu, X, LogOut, LayoutDashboard, Calendar as CalendarIcon, Download, FileText, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayWiseActive, setDayWiseActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedView, setSelectedView] = useState('daywise');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ams_theme') || 'dark';
  });

  const getBranchColor = (branch) => {
    const branchColors = {
      'Computer Science': '#3b82f6',
      'Info Tech': '#8b5cf6',
      'Electronics': '#ef4444',
      'Electrical': '#f59e0b',
      'Mechanical': '#10b981',
      'Civil': '#06b6d4',
      'IoT': '#f97316',
      'AI&DS': '#ec4899',
      'General': '#64748b'
    };
    return branchColors[branch] || '#64748b';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
    const fetchAttendanceAndSubjects = async () => {
      try {
        setLoading(true);
        const [attRes, subRes] = await Promise.all([
          api.get(`/attendance/student/${user._id}`),
          api.get('/subjects')
        ]);

        const data = attRes.data;
        const attendedSubjectIds = new Set(data.map(r => r.subject?._id).filter(Boolean));
        const filteredSubjects = subRes.data.filter(s => attendedSubjectIds.has(s._id));
        setAllSubjects(filteredSubjects);

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

        filteredSubjects.forEach(sub => {
          if (!courseMap[sub._id]) {
            courseMap[sub._id] = {
              name: `${sub.name}${sub.code ? ` (${sub.code})` : ''}`,
              type: sub.type,
              present: 0,
              total: 0
            };
          }
        });

        const processedCourseData = Object.values(courseMap).map(course => ({
          ...course,
          percent: course.total > 0 ? (course.present / course.total) * 100 : 0
        }));
        setCourseData(processedCourseData);

        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendance(sortedData);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        setLoading(false);
      }
    };
    if (user) fetchAttendanceAndSubjects();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = useMemo(() => {
    const totalDays = attendance.length;
    const presentCount = attendance.filter(r => r.status === 'present').length;
    const absentCount = attendance.filter(r => r.status === 'absent').length;
    const lateCount = attendance.filter(r => r.status === 'late').length;
    const attendedDays = presentCount + lateCount;
    const percentage = totalDays > 0 ? ((attendedDays / totalDays) * 100).toFixed(1) : 0;
    return { totalDays, presentCount, absentCount, lateCount, percentage };
  }, [attendance]);

  const PIE_DATA = useMemo(() => [
    { name: 'Present', value: stats.presentCount, color: '#10b981' },
    { name: 'Late', value: stats.lateCount, color: '#f59e0b' },
    { name: 'Absent', value: stats.absentCount, color: '#ef4444' }
  ].filter(d => d.value > 0), [stats]);

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#1e293b', padding: '12px', border: '1px solid #30363d', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>{data.name}</p>
          <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>{data.type}</span>
          <p style={{ margin: '8px 0 4px 0', fontSize: '12px', color: '#94a3b8' }}>Attendance: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{data.present}/{data.total}</span></p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>{((data.present / data.total) * 100).toFixed(1)}% present</p>
        </div>
      );
    }
    return null;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const getDayWiseStatus = (day) => {
    let dayRecords = attendance.filter(a => {
      const dbDate = new Date(a.date);
      return dbDate.getFullYear() === currentYear &&
             dbDate.getMonth() === currentMonth &&
             dbDate.getDate() === day;
    });

    // Filter by selected subject if any
    if (selectedSubject) {
      dayRecords = dayRecords.filter(a => a.subject?._id === selectedSubject._id);
    }

    if (dayRecords.length === 0) return { status: 'noclass', label: 'No Class' };

    const presentCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const attendancePercentage = (presentCount / dayRecords.length) * 100;

    return attendancePercentage >= 50
      ? { status: 'present', label: 'Present (Day)' }
      : { status: 'absent', label: 'Absent (Day)' };
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStatus = getDayWiseStatus(d);
    let cellClass = `cal-cell ${dayStatus.status}`;
    const today = new Date();
    if (today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
      cellClass += ' current-date';
    }
    calendarCells.push(
      <div key={`day-${d}`} className={cellClass} title={dayStatus.label}>
        {d}
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

        <button
          className="sd-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: '#c9d1d9', cursor: 'pointer', padding: '8px' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="sd-nav-links">
          <a href="#" className="sd-nav-link active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="#" onClick={() => navigate('/my-courses')} className="sd-nav-link"><BookOpen size={18} /> My Courses</a>
          <a onClick={(e) => { e.preventDefault(); navigate('/my-attendance'); }} className="sd-nav-link" style={{ cursor: 'pointer' }}>
            <CalendarIcon size={18} /> My Attendance
          </a>
          <a href="#" onClick={() => navigate('/report')} className="sd-nav-link"><FileText size={18} /> Report</a>
          <a href="#" onClick={() => navigate('/download')} className="sd-nav-link"><Download size={18} /> Download</a>
        </div>

        <div className="sd-nav-right">
          <div className="sd-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀' : '🌙'}
          </div>
          <div className="sd-profile-icon">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
          <button onClick={handleLogout} className="sd-logout-btn" title="Logout"><LogOut size={18} /></button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sd-mobile-menu-overlay">
          <div className="sd-mobile-menu">
            <a href="#" className="sd-mobile-nav-link active"><LayoutDashboard size={18} /> Dashboard</a>
            <a href="#" onClick={() => navigate('/my-courses')} className="sd-mobile-nav-link"><BookOpen size={18} /> My Courses</a>
            <a href="/my-attendance" className="sd-mobile-nav-link"><CalendarIcon size={18} /> My Attendance</a>
            <a href="#" onClick={() => navigate('/report')} className="sd-mobile-nav-link"><FileText size={18} /> Report</a>
            <a href="#" onClick={() => navigate('/download')} className="sd-mobile-nav-link"><Download size={18} /> Download</a>
          </div>
        </div>
      )}

      <main className="sd-main-content">

        {/* Welcome Section */}
        <div className="sd-welcome-section" style={{ marginTop: '20px' }}>
          <div>
            <h1 className="sd-welcome-title">Welcome back, {user?.name?.toUpperCase() || 'STUDENT'}!</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{
                background: `${getBranchColor(user?.batch || 'General')}20`,
                color: getBranchColor(user?.batch || 'General'),
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: `1px solid ${getBranchColor(user?.batch || 'General')}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '8px', height: '8px', background: getBranchColor(user?.batch || 'General'), borderRadius: '50%' }}></div>
                {user?.batch || 'General'}
              </span>
              <p className="sd-session-text" style={{ margin: 0 }}>Access your real-time attendance overview below.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sd-stats-grid">
          <div className="sd-stat-card">
            <div className="sd-stat-icon blue"><CalendarIcon size={24} /></div>
            <div className="sd-stat-info">
              <p>Total Course</p>
              <h3>{courseData.length}</h3>
            </div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon purple"><Clock size={24} /></div>
            <div className="sd-stat-info">
              <p>Total Classes</p>
              <h3>{stats.totalDays}</h3>
            </div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon green"><CheckCircle size={24} /></div>
            <div className="sd-stat-info">
              <p>Classes Attended</p>
              <h3>{stats.presentCount + stats.lateCount}</h3>
            </div>
          </div>
          <div className="sd-stat-card">
            <div className="sd-stat-icon dark-green" style={{ background: stats.percentage >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stats.percentage >= 75 ? '#10b981' : '#ef4444' }}>
              {stats.percentage >= 75 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="sd-stat-info">
              <p>Overall Percentage</p>
              <h3 style={{ color: stats.percentage >= 75 ? '#10b981' : '#ef4444' }}>{stats.percentage}%</h3>
              <p style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold', color: stats.percentage >= 75 ? '#10b981' : '#ef4444' }}>
                {stats.percentage >= 75 ? '✅ Eligible (75% Met)' : '⚠️ Short Attendance (Below 75%)'}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="sd-calendar-section" style={{ marginTop: '30px' }}>
          <div className="sd-section-header">
            <h2>Attendance Calendar</h2>

            <div style={{ position: 'relative' }}>
  <span
    onClick={() => setShowDropdown(!showDropdown)}
    style={{
      background: '#3b82f6',
      color: '#ffffff',
      border: '1px solid #3b82f6',
      borderRadius: '8px',
      padding: '6px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    {selectedView === 'daywise' ? 'Day-wise View' : allSubjects.find(s => s._id === selectedView)?.name || 'Day-wise View'}
    <ChevronDown size={14} />
  </span>

  {showDropdown && (
    <div style={{
      position: 'absolute',
      top: '110%',
      left: 0,
      background: '#1e293b',
      border: '1px solid #30363d',
      borderRadius: '8px',
      padding: '8px',
      zIndex: 100,
      minWidth: '200px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      {/* Day-wise option */}
      <div
        onClick={() => { setSelectedView('daywise'); setShowDropdown(false); }}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          color: selectedView === 'daywise' ? '#3b82f6' : '#c9d1d9',
          cursor: 'pointer',
          fontWeight: selectedView === 'daywise' ? '600' : '400',
          background: selectedView === 'daywise' ? '#1e3a5f' : 'transparent'
        }}
        onMouseEnter={e => e.currentTarget.style.background = selectedView === 'daywise' ? '#1e3a5f' : '#2d3748'}
        onMouseLeave={e => e.currentTarget.style.background = selectedView === 'daywise' ? '#1e3a5f' : 'transparent'}
      >
        Day-wise View
      </div>

      {/* Subject options */}
      {allSubjects.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => { setSelectedView(sub._id); setShowDropdown(false); }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: selectedView === sub._id ? '#3b82f6' : '#c9d1d9',
            cursor: 'pointer',
            fontWeight: selectedView === sub._id ? '600' : '400',
            background: selectedView === sub._id ? '#1e3a5f' : 'transparent'
          }}
          onMouseEnter={e => e.currentTarget.style.background = selectedView === sub._id ? '#1e3a5f' : '#2d3748'}
          onMouseLeave={e => e.currentTarget.style.background = selectedView === sub._id ? '#1e3a5f' : 'transparent'}
        >
          {sub.name}{sub.code ? ` (${sub.code})` : ''}
        </div>
      ))}
    </div>
  )}
</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handlePrevMonth} className="sd-calendar-nav-btn"><ChevronLeft size={16} /></button>
              <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button onClick={handleNextMonth} className="sd-calendar-nav-btn"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="sd-calendar-container">
            <div className="sd-calendar-grid">
              <div className="cal-cell header">Sun</div>
              <div className="cal-cell header">Mon</div>
              <div className="cal-cell header">Tue</div>
              <div className="cal-cell header">Wed</div>
              <div className="cal-cell header">Thu</div>
              <div className="cal-cell header">Fri</div>
              <div className="cal-cell header">Sat</div>
              {calendarCells}
            </div>

            <div className="sd-calendar-legend" style={{ marginTop: '15px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                Present (Day)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                Absent (Day)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#374151', borderRadius: '2px' }}></div>
                No Class
              </span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
              Note: Day-wise status is based on attending at least half of the classes on that day
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="sd-two-col-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px' }}>
          <div className="sd-chart-card">
            <h3>Overall Attendance Distribution</h3>
            {PIE_DATA.length > 0 ? (
              <div className="sd-pie-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Days`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="sd-chart-legend" style={{ flexWrap: 'wrap' }}>
                  <span className="sd-legend-item"><span className="sd-dot present"></span> Present</span>
                  <span className="sd-legend-item"><span className="sd-dot absent"></span> Absent</span>
                  <span className="sd-legend-item"><span className="sd-dot" style={{ backgroundColor: '#f59e0b' }}></span>No class</span>
                </div>
              </div>
            ) : (
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No data to display chart.
              </div>
            )}
          </div>

          <div className="sd-chart-card">
            <h3>Course-wise Attendance</h3>
            <div style={{ height: '280px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={0} height={80} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', fill: '#8b949e', fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="percent" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div style={{ marginTop: '40px' }}>
          <div className="sd-section-header">
            <h2>My Courses</h2>
            <a href="#" className="sd-view-all">View All →</a>
          </div>

          <div className="sd-courses-grid">
            {allSubjects.length > 0 ? (
              allSubjects.slice(0, 6).map(sub => {
                const stat = courseData.find(c => c.name.includes(sub.name)) || { percent: 0, present: 0, total: 0 };
                const percent = stat.percent;
                const isDanger = percent > 0 && percent < 75;

                return (
                  <div key={sub._id} className="sd-course-card">
                    <div className="sd-course-header">
                      <div>
                        <h3 className="sd-course-title" title={sub.name}>{sub.name}</h3>
                        {sub.code && <p className="sd-course-code">{sub.code}</p>}
                      </div>
                      <span className="sd-course-type" style={{ background: sub.type === 'LAB' ? '#8b5cf6' : '#3b82f6' }}>
                        {sub.type}
                      </span>
                    </div>

                    <div className="sd-course-progress">
                      <div className="sd-progress-labels">
                        <span>Attendance</span>
                        <span className={`sd-progress-percent ${isDanger ? 'danger' : ''}`}>{percent.toFixed(1)}%</span>
                      </div>
                      <div className="sd-progress-bar-bg">
                        <div className={`sd-progress-bar-fill ${isDanger ? 'danger-bg' : ''}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>

                    <div className="sd-course-footer">
                      <span className="sd-sem">Present: {stat.present}/{stat.total > 0 ? stat.total : '-'}</span>
                      <span style={{ color: '#fff' }}>Teacher: {sub.teacher?.name || 'N/A'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#8b949e', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                No courses have been assigned to your batch yet.
              </p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}