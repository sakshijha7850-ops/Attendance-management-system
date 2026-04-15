import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, LogOut, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', batch: '', role: 'student' });
  const [addingStudent, setAddingStudent] = useState(false);

  const ENGINEERING_CLASSES = [
    'Computer Science', 'Info Tech', 'Electronics',
    'Electrical', 'Mechanical', 'Civil', 'IoT', 'AI&DS'
  ];

  const [subjects, setSubjects] = useState([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubType, setNewSubType] = useState('THEORY');
  const [newSubBatch, setNewSubBatch] = useState('');
  const [newSubSection, setNewSubSection] = useState('A');
  const [subErrors, setSubErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isFormComplete = !!(newSubName?.trim() && newSubCode?.trim() && newSubType);

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch {
      toast.error('Failed to fetch subjects');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubName || !selectedClass) {
      toast.error('Subject name and class are required');
      return;
    }
    try {
      await api.post('/subjects', {
        name: newSubName,
        code: newSubCode,
        type: newSubType,
        batch: selectedClass,
        teacher: user._id
      });
      toast.success('Subject created successfully!');
      setNewSubName('');
      setNewSubCode('');
      setNewSubType('THEORY');
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to create subject');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.batch) {
      toast.error('Please fill all fields');
      return;
    }

    setAddingStudent(true);
    try {
      await api.post('/auth/register', {
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        role: newStudent.role,
        batch: newStudent.batch
      });
      
      toast.success(`${newStudent.role === 'teacher' ? 'Teacher' : 'Student'} added successfully!`);
      setNewStudent({ name: '', email: '', password: '', batch: '', role: 'student' });
      setShowAddStudent(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    } finally {
      setAddingStudent(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Teacher Portal</h1>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Attendance Button */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/take-attendance')}
            style={{
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={20} />
            Take Attendance
          </button>
        </div>

        {/* Add Student Button */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={() => setShowAddStudent(!showAddStudent)}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={20} />
            Add User
          </button>
        </div>

        {/* Add Student Form */}
        {showAddStudent && (
          <div style={{ 
            background: 'rgba(59,130,246,0.1)', 
            border: '1px solid rgba(59,130,246,0.3)', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '24px' 
          }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '16px', textAlign: 'center' }}>➕ Add New User</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '14px' }}>Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Enter name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '14px' }}>Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="  Enter email address"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '14px' }}>Password</label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '14px' }}>Role</label>
                <select
                  value={newStudent.role}
                  onChange={(e) => setNewStudent({...newStudent, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                >
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '14px' }}>Class/Batch</label>
                <select
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({...newStudent, batch: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    background: '#161b22',
                    color: '#c9d1d9',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Class</option>
                  {ENGINEERING_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: addingStudent ? '#6c757d' : '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: addingStudent ? 'not-allowed' : 'pointer'
                }}
              >
                {addingStudent ? 'Adding...' : `Add ${newStudent.role === 'teacher' ? 'Teacher' : 'Student'}`}
              </button>
              <button
                onClick={() => {
                  setShowAddStudent(false);
                  setNewStudent({ name: '', email: '', password: '', batch: '', role: 'student' });
                }}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#c9d1d9',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '28px 0' }} />

        {/* Add Subject Section */}
        <div className="add-student-form" style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ color: '#e6edf3', margin: 0, fontSize: '15px', fontWeight: '600' }}>
              ➕ Add New Subject
            </h3>
          </div>

          <form className="form-grid" onSubmit={handleCreateSubject} style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
              <input type="text" placeholder="Subject Name"
                className={`add-input ${subErrors.name ? 'error-border' : ''}`}
                style={{ width: '90%' }} value={newSubName} disabled={isCreating}
                onChange={e => { setNewSubName(e.target.value); setSubErrors(p => ({...p, name: ''})); }}
              />
              {subErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{subErrors.name}</span>}
            </div>

            <div style={{ flex: '0 0 140px', display: 'flex', flexDirection: 'column' }}>
              <input type="text" placeholder="Course Code"
                className={`add-input ${subErrors.code ? 'error-border' : ''}`}
                style={{ width: '80%' }} value={newSubCode} disabled={isCreating}
                onChange={e => { setNewSubCode(e.target.value); setSubErrors(p => ({...p, code: ''})); }}
              />
              {subErrors.code && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{subErrors.code}</span>}
            </div>

            <div style={{ flex: '0 0 120px' }}>
              <select className="add-input" value={newSubType} onChange={e => setNewSubType(e.target.value)} disabled={isCreating} style={{ width: '100%' }}>
                <option value="THEORY">Theory</option>
                <option value="LAB">Lab</option>
                <option value="PRACTICAL">Practical</option>
              </select>
            </div>

            <div style={{ flex: '1 1 150px' }}>
              <select className="add-input" value={newSubBatch} onChange={e => setNewSubBatch(e.target.value)} disabled={isCreating} style={{ width: '100%' }}>
                <option value="">-- Select Class --</option>
                {ENGINEERING_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '0 0 120px' }}>
              <select className="add-input" value={newSubSection} onChange={e => setNewSubSection(e.target.value)} disabled={isCreating} style={{ width: '100%' }}>
                <option value="A">Batch A</option>
                <option value="B">Batch B</option>
                <option value="C">Batch C</option>
                <option value="D">Batch D</option>
              </select>
            </div>

            {successMessage && (
              <div style={{ width: '100%', marginTop: '8px', padding: '10px', color: '#10b981', fontSize: '14px', fontWeight: 'bold', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button type="submit" disabled={isCreating} className="submit-student-btn"
                style={{ background: isFormComplete ? '#10b981' : '#3b82f6', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1 }}>
                {isCreating ? '⏳ Submitting...' : 'Submit & Go to Attendance'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '28px 0' }} />
        {/* Already added subjects list */}
{subjects.length > 0 && (
  <div style={{ marginTop: '20px' }}>
    <h3 style={{ color: '#e6edf3', fontSize: '14px', marginBottom: '10px' }}>
      📚 Your Subjects:
    </h3>
    {subjects.map(sub => (
      <div key={sub._id} 
        onClick={() => navigate('/take-attendance', { state: { selectedClass: sub.batch.split(' - ')[0].trim(), selectedSubjectId: sub._id } })}
        style={{ background: '#1e293b', padding: '10px 16px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ color: '#e6edf3', fontWeight: 'bold' }}>{sub.name}</span>
        <span style={{ color: '#8b949e', fontSize: '12px' }}>{sub.code} · {sub.batch}</span>
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}
