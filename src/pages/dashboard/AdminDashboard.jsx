import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './StudentDashboard.css'; 

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [batch, setBatch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editBatch, setEditBatch] = useState('');

  // Smart Email Parsing for College Format (e.g. 26io1sa01@gmail.com)
  useEffect(() => {
    if (email) {
      // Look for format: 2-digit year (e.g. 26), then branch chars (io, cs, ee, ec, ce, me, it)
      const match = email.match(/^(\d{2})(io|cs|ee|ec|ce|me|it)/i);
      if (match) {
        const branchCode = match[2].toLowerCase();
        
        let branchName = 'General';
        if (branchCode === 'io') branchName = 'IoT';
        else if (branchCode === 'cs') branchName = 'Computer Science';
        else if (branchCode === 'it') branchName = 'Info Tech';
        else if (branchCode === 'ee') branchName = 'Electrical';
        else if (branchCode === 'ec') branchName = 'Electronics';
        else if (branchCode === 'ce') branchName = 'Civil';
        else if (branchCode === 'me') branchName = 'Mechanical';
        
        setBatch(branchName);
      }
    }
  }, [email, role]);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { 
        name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email, 
        password: 'temp123', // Temporary password
        role, 
        batch: batch || 'General' 
      });
      toast.success('User added successfully!');
      setEmail('');
      setBatch('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditBatch(user.batch);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating user:', editingUser._id);
    console.log('Update data:', { email: editEmail, role: editRole, batch: editBatch || 'General' });
    
    try {
      const response = await api.put(`/users/${editingUser._id}`, { 
        email: editEmail, 
        role: editRole, 
        batch: editBatch || 'General' 
      });
      console.log('Update response:', response.data);
      toast.success('User updated successfully!');
      setEditingUser(null);
      setEditEmail('');
      setEditRole('student');
      setEditBatch('');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      // Don't close the modal on error, let user try again
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the authorized list?')) {
      console.log('Deleting user:', userId);
      try {
        const response = await api.delete(`/users/${userId}`);
        console.log('Delete response:', response);
        toast.success('User removed successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to remove user');
      }
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditEmail('');
    setEditRole('student');
    setEditBatch('');
  };

  return (
    <div className="sd-min-h-screen sd-bg-dark sd-text-light">
      <nav className="sd-navbar">
        <div className="sd-nav-brand">
          <div className="sd-logo-circle"></div>
          <span className="sd-brand-text">AMS Admin</span>
        </div>
        <div className="sd-nav-right">
          <div className="sd-profile-icon">A</div>
          <button onClick={handleLogout} className="sd-logout-btn" title="Logout">Logout</button>
        </div>
      </nav>

      <main className="sd-main-content">
        <div className="sd-welcome-section">
          <div>
            <h1 className="sd-welcome-title">College Administration</h1>
            <p className="sd-session-text">Manage Official Emails & Batches</p>
          </div>
        </div>

        <div className="sd-two-col-grid" style={{ marginTop: '20px' }}>
          {/* Add New User Form */}
          <div className="sd-chart-card">
            <h3>Add New User</h3>
            <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '20px' }}>
              Add a new user directly to the system. They will be able to login immediately with the temporary password "temp123".
            </p>
            
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>College Email ID</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  placeholder="College Email ID"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Role</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option style={{color:'#000'}} value="student">Student</option>
                    <option style={{color:'#000'}} value="teacher">Teacher</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Batch / Class (Auto-detected)</label>
                  <input 
                    type="text" 
                    required
                    value={batch}
                    onChange={e => setBatch(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    placeholder="Batch / Class Name"
                  />
                </div>
              </div>

              <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                Add User
              </button>
            </form>
          </div>

          {/* List of Users */}
          <div className="sd-chart-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>User Directory</h3>
              <button
                onClick={fetchUsers}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '400px', padding: '0 24px 24px 24px', marginTop: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Role</th>
                    <th style={{ padding: '10px' }}>Batch</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px', color: '#fff', fontWeight: 'bold' }}>{u.name}</td>
                      <td style={{ padding: '12px 10px', color: '#fff' }}>{u.email}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '12px', 
                          background: u.role === 'teacher' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: u.role === 'teacher' ? '#3b82f6' : '#10b981'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{u.batch}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <button
                          onClick={() => startEdit(u)}
                          style={{ 
                            marginRight: '8px', 
                            padding: '4px 8px', 
                            background: '#3b82f6', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          style={{ 
                            padding: '4px 8px', 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>No emails authorized yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Edit User</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Email</label>
                <input 
                  type="email" 
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Role</label>
                <select 
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option style={{color:'#000'}} value="student">Student</option>
                  <option style={{color:'#000'}} value="teacher">Teacher</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Batch / Class</label>
                <input 
                  type="text" 
                  required
                  value={editBatch}
                  onChange={e => setEditBatch(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#3b82f6', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Update
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#64748b', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
