import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Users, Award, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../services/api";
import "./dashboard/TeacherDashboard.css";

export default function GiveMarks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Data passed from TakeAttendance page via navigate state
  const {
    students: passedStudents = [],
    selectedClass = '',
    selectedSubjectId = '',
    subjectName = '',
  } = location.state || {};

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [outOf, setOutOf] = useState(100);
  const [examTitle, setExamTitle] = useState('');

  useEffect(() => {
    console.log('GiveMarks - Passed students:', passedStudents);
    console.log('GiveMarks - Selected class:', selectedClass);
    
    if (passedStudents.length > 0) {
      setStudents(passedStudents);
      console.log('Using passed students:', passedStudents.length);
    } else {
      // Fallback - fetch all students
      api.get('/users')
        .then(({ data }) => {
          const studentUsers = data.filter(u => u.role === 'student');
          setStudents(studentUsers);
          console.log('Fetched students from API:', studentUsers.length);
        })
        .catch((error) => {
          console.error('Error fetching students:', error);
          toast.error('Failed to fetch students');
        });
    }
  }, [passedStudents, selectedClass]);

  const handleMarkChange = (studentId, value) => {
    const num = value === '' ? '' : Math.min(Math.max(0, Number(value)), outOf);
    setMarks(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSubmit = async () => {
    if (!examTitle) {
      toast.error('Please enter exam title');
      return;
    }

    setSubmitting(true);
    try {
      // Submit marks for each student
      const promises = Object.entries(marks).map(([studentId, mark]) => {
        if (mark !== '' && mark !== undefined) {
          return api.post('/marks/assign', {
            studentId,
            subject: subjectName || 'General',
            marks: mark
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success('Marks assigned successfully!');
      setSubmitting(false);
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error assigning marks:', error);
      toast.error('Failed to assign marks');
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Assign Marks</h1>
          <button onClick={logout} className="logout-btn">
            <ArrowLeft size={18} /> Logout
          </button>
        </div>

        {/* Class Info */}
        {selectedClass && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#1e293b', borderRadius: '8px', border: '1px solid #30363d' }}>
            <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>Class Information</div>
            <div style={{ color: '#e6edf3', fontWeight: '500' }}>
              {selectedClass} {subjectName && `- ${subjectName}`}
            </div>
          </div>
        )}

        {/* Exam Details */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>Exam Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '14px' }}>
                Exam Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder=""
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
              <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '14px' }}>
                Total Marks
              </label>
              <input
                type="number"
                value={outOf}
                onChange={(e) => setOutOf(Number(e.target.value))}
                min="1"
                max="1000"
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
        </div>

        {/* Students List */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>
            Students ({students.length})
          </h3>
          
          {students.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div>No students found</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Please make sure you have students in the selected class
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {students.map((student) => (
                <div
                  key={student._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #30363d'
                  }}
                >
                  <div>
                    <div style={{ color: '#e6edf3', fontWeight: '500' }}>
                      {student.name}
                    </div>
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>
                      {student.email}
                    </div>
                    {student.rollNumber && (
                      <div style={{ color: '#8b949e', fontSize: '12px' }}>
                        Roll: {student.rollNumber}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={marks[student._id] || ''}
                      onChange={(e) => handleMarkChange(student._id, e.target.value)}
                      placeholder="0"
                      min="0"
                      max={outOf}
                      style={{
                        width: '80px',
                        padding: '6px',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        background: '#161b22',
                        color: '#c9d1d9',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ color: '#8b949e', fontSize: '12px' }}>
                      / {outOf}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {students.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !examTitle}
              style={{
                padding: '12px 32px',
                border: 'none',
                borderRadius: '8px',
                background: submitting || !examTitle ? '#6c757d' : '#10b981',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || !examTitle ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Save size={18} />
                  Submit Marks
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
