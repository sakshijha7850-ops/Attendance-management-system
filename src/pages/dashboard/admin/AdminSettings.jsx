import { useState, useEffect } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const { data } = await api.get('/admin/classes');
      setClasses(data);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoadingClasses(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await api.post('/admin/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account and system configuration</p>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><Lock size={18} style={{display:'inline',verticalAlign:'middle',marginRight:8}} />Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="admin-form-group">
              <label>Current Password</label>
              <input className="admin-input" type="password" required value={pwForm.currentPassword}
                onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} placeholder="Enter current password" />
            </div>
            <div className="admin-form-group">
              <label>New Password</label>
              <input className="admin-input" type="password" required value={pwForm.newPassword}
                onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} placeholder="Enter new password" />
            </div>
            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input className="admin-input" type="password" required value={pwForm.confirmPassword}
                onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} placeholder="Confirm new password" />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}}>
              Update Password
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>🏫 Manage Classes / Batches</h3>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchClasses}><RefreshCw size={14} /></button>
          </div>
          {loadingClasses ? (
            <div className="admin-loading"><div className="admin-spinner" /></div>
          ) : classes.length === 0 ? (
            <div className="admin-empty"><p>No classes found</p></div>
          ) : (
            <div className="admin-class-list">
              {classes.map(c => (
                <div key={c.batch} className="admin-class-item">
                  <span style={{color:'#fff',fontWeight:600}}>{c.batch}</span>
                  <span className="admin-class-count">{c.studentCount} students</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
