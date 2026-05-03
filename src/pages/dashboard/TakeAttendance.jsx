import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './TeacherDashboard.css';

export default function TakeAttendance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    location.state?.selectedSubjectId || ''
  );
  const [selectedClass, setSelectedClass] = useState(
    location.state?.selectedClass || localStorage.getItem('selectedClass') || ''
  );
  const [subjects, setSubjects] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitted, setSubmitted] = useState(false);

    const ENGINEERING_CLASSES = [
  'Computer Science - A',
  'Computer Science - B', 
  'Info Tech - A',
  'Info Tech - B',
  'Electronics - A',
    'Electronics - B',
  'Electrical - A',
   'Electrical - B',
  'Mechanical - A',
   'Mechanical - B',
  'Civil - A',
    'Civil - B',
  'IoT - A',
    'IoT - B',
  'AI&DS - A',
    'AI&DS - B'
];
  

  // Fetch subjects once on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(data);
        if (data.length > 0 && !location.state?.selectedSubjectId) {
          setSelectedSubjectId(data[0]._id);
        }
      } catch {
        toast.error('Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  // Fetch students when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem('selectedClass', selectedClass);
    } else {
      localStorage.removeItem('selectedClass');
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/auth/students', {
          params: { batch: selectedClass }
        });
        setStudents(data || []);
      } catch {
        toast.error('Failed to fetch students');
        setStudents([]);
      }
    };

    fetchStudents();
    const interval = setInterval(fetchStudents, 3000);
    return () => clearInterval(interval);
  }, [selectedClass]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first');
      return;
    }
    if (students.length === 0) {
      toast.error('No students found');
      return;
    }

    const records = students.map(student => ({
      studentId: student._id,
      status: attendanceRecords[student._id] || 'present'
    }));

    try {
      await api.post('/attendance', { records, date, subjectId: selectedSubjectId });
      toast.success('Attendance submitted successfully!');
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit attendance');
    }
  };

  const sortedStudents = [...students].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  const selectedSubject = subjects.find(s => s._id === selectedSubjectId);

  // Success screen
  if (submitted) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#10b981', fontSize: '24px', marginBottom: '12px' }}>
            Attendance Submitted!
          </h2>
          <p style={{ color: '#8b949e', marginBottom: '32px' }}>
            {selectedSubject?.name} · {selectedClass} · {date}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSubmitted(false); setAttendanceRecords({}); }}
              style={{ background: '#3b82f6', color: '#fff', padding: '12px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📋 Take Another Attendance
            </button>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              style={{ background: '#1e293b', color: '#fff', padding: '12px 28px', borderRadius: '8px', border: '1px solid #30363d', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              style={{ background: 'transparent', border: '1px solid #30363d', color: '#8b949e', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Back
            </button>
            <h1 className="dashboard-title" style={{ margin: 0 }}>📋 Take Attendance</h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">Log Out</button>
        </div>

        {/* ✅ Class + Subject + Date Selectors */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Class Selector */}
          <div>
            <label style={{ color: '#8b949e', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Select Class / Batch
            </label>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setStudents([]);
                setAttendanceRecords({});
              }}
              style={{
                width: '100%', background: '#1e293b', color: '#e2e8f0',
                border: '1px solid #30363d', borderRadius: '8px',
                padding: '10px 12px', fontSize: '14px'
              }}
            >
              <option value="">-- Select Class --</option>
              {ENGINEERING_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label style={{ color: '#8b949e', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              style={{
                width: '100%', background: '#1e293b', color: '#e2e8f0',
                border: '1px solid #30363d', borderRadius: '8px',
                padding: '10px 12px', fontSize: '14px'
              }}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={{ color: '#8b949e', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: '100%', background: '#1e293b', color: '#e2e8f0',
                border: '1px solid #30363d', borderRadius: '8px',
                padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Status Messages */}
        {selectedClass && students.length > 0 && selectedSubjectId && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '12px',
            borderRadius: '8px', textAlign: 'center', marginBottom: '20px',
            border: '1px solid rgba(16,185,129,0.3)'
          }}>
            ✅ <strong>{students.length} students</strong> in <strong>{selectedClass}</strong> · Subject: <strong>{selectedSubject?.name}</strong>
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '12px',
            borderRadius: '8px', textAlign: 'center', marginBottom: '20px',
            border: '1px solid rgba(245,158,11,0.3)'
          }}>
            ⚠️ No students found for <strong>{selectedClass}</strong>
          </div>
        )}

        {/* Student List */}
        {sortedStudents.length > 0 && (
          <div className="student-list" style={{ border: '2px solid rgba(16,185,129,0.3)', borderRadius: '8px' }}>
            {sortedStudents.map((student, index) => (
              <div key={student._id} className="student-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    width: '26px', height: '26px', background: 'rgba(59,130,246,0.2)',
                    color: '#3b82f6', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 'bold', flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span className="student-name">{student.name}</span>
                  <span style={{ fontSize: '11px', color: '#8b949e' }}>{student.email}</span>
                  {attendanceRecords[student._id] && (
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                      fontWeight: 'bold', textTransform: 'capitalize',
                      background: attendanceRecords[student._id] === 'present'
                        ? 'rgba(16,185,129,0.2)'
                        : attendanceRecords[student._id] === 'absent'
                        ? 'rgba(239,68,68,0.2)'
                        : 'rgba(245,158,11,0.2)',
                      color: attendanceRecords[student._id] === 'present'
                        ? '#10b981'
                        : attendanceRecords[student._id] === 'absent'
                        ? '#ef4444'
                        : '#f59e0b'
                    }}>
                      {attendanceRecords[student._id]}
                    </span>
                  )}
                </div>
                <div className="action-buttons" style={{ marginTop: '8px' }}>
                  <button
                    onClick={() => handleStatusChange(student._id, 'present')}
                    className={`action-btn btn-present ${attendanceRecords[student._id] === 'present' ? 'active' : ''}`}
                  >Present</button>
                  <button
                    onClick={() => handleStatusChange(student._id, 'absent')}
                    className={`action-btn btn-absent ${attendanceRecords[student._id] === 'absent' ? 'active' : ''}`}
                  >Absent</button>
                  <button
                    onClick={() => handleStatusChange(student._id, 'late')}
                    className={`action-btn btn-late ${attendanceRecords[student._id] === 'late' ? 'active' : ''}`}
                  >Late</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Buttons */}
        {sortedStudents.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={submitAttendance}
              className="submit-attendance-btn"
              style={{ flex: 1, background: '#10b981', boxShadow: '0 0 20px rgba(16,185,129,0.3)', marginTop: 0 }}
            >
              📝 Submit Attendance
            </button>

            <button
              onClick={() => navigate('/give-marks', {
                state: {
                  students: sortedStudents,
                  selectedClass,
                  selectedSubjectId,
                  subjectName: selectedSubject?.name,
                }
              })}
              style={{
                background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.4)', padding: '14px 22px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                fontSize: '14px', display: 'flex', alignItems: 'center',
                gap: '8px', whiteSpace: 'nowrap', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
            >
              📊 Report / Marks
            </button>
          </div>
        )}

      </div>
    </div>
  );
}