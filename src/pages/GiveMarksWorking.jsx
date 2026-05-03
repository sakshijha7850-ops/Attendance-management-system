import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Users, Award, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../services/api";
import "./dashboard/TeacherDashboard.css";

const EXAM_TYPES = [
  { value: 'Minor 1', label: 'Minor 1', outOf: 25 },
  { value: 'Minor 2', label: 'Minor 2', outOf: 25 },
  { value: 'Major', label: 'End Sem (Major)', outOf: 30 },
];

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
  const [examType, setExamType] = useState('');
  const [outOf, setOutOf] = useState(0);

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

  const handleExamTypeChange = (value) => {
    setExamType(value);
    const config = EXAM_TYPES.find(e => e.value === value);
    setOutOf(config ? config.outOf : 0);
    // Reset marks when exam type changes
    setMarks({});
  };

  const handleMarkChange = (studentId, value) => {
    const num = value === '' ? '' : Math.min(Math.max(0, Number(value)), outOf);
    setMarks(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSubmit = async () => {
    if (!examType) {
      toast.error('Please select exam type');
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
            examType: examType,
            marks: mark
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(`${examType} marks assigned successfully!`);
      setSubmitting(false);
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error assigning marks:', error);
      toast.error(error.response?.data?.message || 'Failed to assign marks');
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

        {/* Exam Type Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>Select Exam Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {EXAM_TYPES.map(exam => (
              <button
                key={exam.value}
                onClick={() => handleExamTypeChange(exam.value)}
                style={{
                  padding: '16px 12px',
                  border: examType === exam.value ? '2px solid #6366f1' : '1px solid #30363d',
                  borderRadius: '12px',
                  background: examType === exam.value
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))'
                    : '#161b22',
                  color: examType === exam.value ? '#fff' : '#8b949e',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{ 
                  fontSize: '20px', marginBottom: '8px',
                  filter: examType === exam.value ? 'none' : 'grayscale(0.5)'
                }}>
                  {exam.value === 'Minor 1' ? '📝' : exam.value === 'Minor 2' ? '📋' : '🎓'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                  {exam.label}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: examType === exam.value ? '#a78bfa' : '#64748b',
                  fontWeight: '500'
                }}>
                  Out of {exam.outOf} marks
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Students List */}
        {examType && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#e6edf3', margin: 0 }}>
                Students ({students.length})
              </h3>
              <span style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: 'rgba(99,102,241,0.12)', color: '#818cf8'
              }}>
                {examType} — Out of {outOf}
              </span>
            </div>
            
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
                        value={marks[student._id] ?? ''}
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
        )}

        {/* Submit Button */}
        {students.length > 0 && examType && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !examType}
              style={{
                padding: '12px 32px',
                border: 'none',
                borderRadius: '8px',
                background: submitting || !examType ? '#6c757d' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || !examType ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: submitting || !examType ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Save size={18} />
                  Submit {examType} Marks
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
