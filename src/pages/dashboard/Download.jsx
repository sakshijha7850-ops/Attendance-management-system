import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Calendar, User, Clock, CheckCircle, X, AlertTriangle, Download as DownloadIcon, FileText, FileSpreadsheet, Printer, Mail } from 'lucide-react';
import api from '../../services/api';
import './StudentDashboard.css';

export default function Download() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('ams_theme') || 'dark');
  const [marks, setMarks] = useState([]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ams_theme', newTheme);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/attendance/student/${user._id}`);
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendance(sortedData);

      // Marks fetch 
      try {
        const marksRes = await api.get(`/marks/student/${user._id}`);
        setMarks(marksRes.data || []);
      } catch {
        setMarks([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };
  if (user) fetchData();
}, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  // Calculate stats
  const totalDays = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = attendance.filter(r => r.status === 'absent').length;
  const lateCount = attendance.filter(r => r.status === 'late').length;
  const attendedDays = presentCount + lateCount;
  const percentage = totalDays > 0 ? (((presentCount + lateCount) / totalDays) * 100).toFixed(1) : 0;

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Time', 'Subject', 'Status', 'Faculty'];
    const rows = attendance.map(record => [
      new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      new Date(record.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      record.subject?.name || 'N/A',
      record.status.toUpperCase(),
      record.markedBy?.name || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${user?.name || 'student'}_${new Date().toLocaleDateString('en-IN')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance report downloaded successfully!');
  };

  const downloadPDF = () => {
    // Simple text-based PDF download (for now)
    let content = `ATTENDANCE REPORT\n`;
    content += `================\n\n`;
    content += `Student: ${user?.name || 'N/A'}\n`;
    content += `Email: ${user?.email || 'N/A'}\n`;
    content += `Batch: ${user?.batch || 'N/A'}\n`;
    content += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    content += `SUMMARY\n`;
    content += `-------\n`;
    content += `Total Classes: ${totalDays}\n`;
    content += `Present: ${presentCount}\n`;
    content += `Absent: ${absentCount}\n`;
    content += `Late: ${lateCount}\n`;
    content += `Attendance %: ${percentage}%\n\n`;
    content += `DETAILED RECORDS\n`;
    content += `----------------\n\n`;
    
    attendance.forEach((record, index) => {
      content += `${index + 1}. ${new Date(record.date).toLocaleDateString('en-IN')} - ${record.subject?.name || 'N/A'} - ${record.status.toUpperCase()} - ${record.markedBy?.name || 'N/A'}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${user?.name || 'student'}_${new Date().toLocaleDateString('en-IN')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance report downloaded successfully!');
  };

  const printReport = () => {
    window.print();
    toast.success('Print dialog opened!');
  };

  const emailReport = () => {
    // Create email content
    const subject = `Attendance Report - ${user?.name || 'Student'}`;
    const body = `Dear Sir/Madam,\n\nPlease find my attendance report below:\n\nTotal Classes: ${totalDays}\nPresent: ${presentCount}\nAbsent: ${absentCount}\nLate: ${lateCount}\nAttendance %: ${percentage}%\n\nFor detailed records, please check the system.\n\nThank you,\n${user?.name || 'Student'}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Email client opened!');
  };

  if (loading) {
    return (
      <div className={`sd-min-h-screen sd-bg-dark sd-text-light ${theme}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading download options...</div>
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
          <a onClick={() => navigate('/report')} className="sd-nav-link" style={{cursor:'pointer'}}>
            <FileText size={18} /> Report
          </a>
          <a className="sd-nav-link active" style={{cursor:'pointer'}}>
            <DownloadIcon size={18} /> Download
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
          <h1 className="sd-welcome-title">Download Attendance</h1>
          <p style={{ color: '#8b949e', marginTop: '8px' }}>Download your attendance reports in various formats</p>
        </div>

        {/* Summary Stats */}
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
            <div className="sd-stat-info"><p>Attendance %</p><h3 style={{ color: percentage >= 75 ? '#10b981' : '#ef4444' }}>{percentage}%</h3></div>
          </div>
        </div>

        {/* Download Options */}
        <div className="sd-chart-card" style={{ marginBottom: '30px' }}>
          <h3>Download Options</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <button 
              onClick={downloadCSV}
              style={{
                padding: '20px',
                border: '1px solid #30363d',
                borderRadius: '8px',
                background: '#161b22',
                color: '#c9d1d9',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => e.target.style.background = '#1c2128'}
              onMouseOut={(e) => e.target.style.background = '#161b22'}
            >
              <FileSpreadsheet size={32} color="#10b981" />
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#c9d1d9' }}>CSV Format</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#8b949e' }}>Download as Excel-compatible CSV file</p>
              </div>
            </button>

            <button 
              onClick={downloadPDF}
              style={{
                padding: '20px',
                border: '1px solid #30363d',
                borderRadius: '8px',
                background: '#161b22',
                color: '#c9d1d9',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => e.target.style.background = '#1c2128'}
              onMouseOut={(e) => e.target.style.background = '#161b22'}
            >
              <FileText size={32} color="#3b82f6" />
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#c9d1d9' }}>Text Format</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#8b949e' }}>Download as plain text report</p>
              </div>
            </button>

            <button 
              onClick={printReport}
              style={{
                padding: '20px',
                border: '1px solid #30363d',
                borderRadius: '8px',
                background: '#161b22',
                color: '#c9d1d9',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => e.target.style.background = '#1c2128'}
              onMouseOut={(e) => e.target.style.background = '#161b22'}
            >
              <Printer size={32} color="#f59e0b" />
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#c9d1d9' }}>Print Report</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#8b949e' }}>Print directly from browser</p>
              </div>
            </button>

            <button 
              onClick={emailReport}
              style={{
                padding: '20px',
                border: '1px solid #30363d',
                borderRadius: '8px',
                background: '#161b22',
                color: '#c9d1d9',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => e.target.style.background = '#1c2128'}
              onMouseOut={(e) => e.target.style.background = '#161b22'}
            >
              <Mail size={32} color="#ef4444" />
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#c9d1d9' }}>Email Report</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#8b949e' }}>Send via email</p>
              </div>
            </button>
          </div>
        </div>

      
       {/* Result Preview */}
<div className="sd-chart-card">
  <h3>Result Preview</h3>

  {/* Attendance Subject-wise */}
  <h4 style={{ color: '#8b949e', marginTop: '20px', marginBottom: '10px', fontSize: '14px' }}>
    Attendance Summary
  </h4>
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #30363d' }}>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Subject</th>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Total</th>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Present</th>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Absent</th>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Attendance %</th>
          <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontWeight: '600' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const subjectMap = {};
          attendance.forEach(record => {
            const subName = record.subject?.name || 'N/A';
            if (!subjectMap[subName]) subjectMap[subName] = { present: 0, absent: 0, late: 0, total: 0 };
            subjectMap[subName].total++;
            if (record.status === 'present') subjectMap[subName].present++;
            else if (record.status === 'absent') subjectMap[subName].absent++;
            else if (record.status === 'late') subjectMap[subName].late++;
          });

          return Object.entries(subjectMap).map(([subName, data], index) => {
            const attended = data.present + data.late;
            const percent = data.total > 0 ? ((attended / data.total) * 100).toFixed(1) : 0;
            const isEligible = percent >= 75;
            return (
              <tr key={index} style={{ borderBottom: '1px solid #30363d' }}>
                <td style={{ padding: '12px', color: '#c9d1d9', fontWeight: '500' }}>{subName}</td>
                <td style={{ padding: '12px', color: '#c9d1d9' }}>{data.total}</td>
                <td style={{ padding: '12px', color: '#10b981' }}>{attended}</td>
                <td style={{ padding: '12px', color: '#ef4444' }}>{data.absent}</td>
                <td style={{ padding: '12px', color: isEligible ? '#10b981' : '#ef4444', fontWeight: '600' }}>{percent}%</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                    background: isEligible ? '#10b98120' : '#ef444420',
                    color: isEligible ? '#10b981' : '#ef4444'
                  }}>
                    {isEligible ? 'ELIGIBLE' : 'SHORT'}
                  </span>
                </td>
              </tr>
            );
          });
        })()}
      </tbody>
    </table>
  </div>

  {/* Marks Details */}
  {marks.length > 0 && (
    <>
      <h4 style={{ color: '#8b949e', marginTop: '30px', marginBottom: '10px', fontSize: '14px' }}>
        Marks Summary
      </h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              const grade = mark.marks >= 20 ? 'A+' : mark.marks >= 15 ? 'A' : mark.marks >= 11 ? 'B+' : mark.marks >= 8 ? 'C' : mark.marks >= 5 ? 'D' : 'F';
              return (
                <tr key={index} style={{ borderBottom: '1px solid #30363d' }}>
                  <td style={{ padding: '12px', color: '#c9d1d9' }}>{mark.subject}</td>
                  <td style={{ padding: '12px', color: mark.marks >= 15 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{mark.marks}</td>
                  <td style={{ padding: '12px', color: '#8b949e' }}>{new Date(mark.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      background: grade === 'A+' || grade === 'A' ? '#10b98120' : grade === 'B+' || grade === 'B' ? '#f59e0b20' : '#ef444420',
                      color: grade === 'A+' || grade === 'A' ? '#10b981' : grade === 'B+' || grade === 'B' ? '#f59e0b' : '#ef4444'
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
    </>
  )}
</div>
      </main>
    </div>
  );
}