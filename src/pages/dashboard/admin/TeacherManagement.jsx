import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, Eye } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  'Computer Science','Info Tech','Electronics','Electrical',
  'Mechanical','Civil','IoT','AI&DS','General'
];

export default function TeacherManagement({ onViewProfile }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', batch:'General', phoneNumber:'' });

  useEffect(() => { fetchTeachers(); }, [search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/admin/teachers', { params });
      setTeachers(data);
    } catch { toast.error('Failed to fetch teachers'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name:'', email:'', batch:'General', phoneNumber:'' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, batch: t.batch || 'General', phoneNumber: t.phoneNumber || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/teachers/${editing._id}`, form);
        toast.success('Teacher updated!');
      } else {
        await api.post('/admin/teachers', form);
        toast.success('Teacher added!');
      }
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher and all their subjects/attendance?')) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      toast.success('Teacher deleted!');
      fetchTeachers();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>👩‍🏫 Teacher Management</h1>
        <p>Manage teachers and view their assigned subjects</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <div className="admin-search-box">
              <Search size={16} className="admin-search-icon" />
              <input placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchTeachers}><RefreshCw size={14} /> Refresh</button>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}><Plus size={16} /> Add Teacher</button>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : teachers.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">📭</div><p>No teachers found</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr>
                <th>Name</th><th>Email</th><th>Department</th><th>Subjects</th><th>Phone</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t._id}>
                    <td style={{fontWeight:600,color:'#fff'}}>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.batch || 'General'}</td>
                    <td>
                      {t.subjectCount > 0 ? (
                        <span className="admin-badge admin-badge-teacher">{t.subjectCount} subjects</span>
                      ) : (
                        <span style={{color:'#64748b',fontSize:12}}>None assigned</span>
                      )}
                    </td>
                    <td>{t.phoneNumber || '-'}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="admin-btn-icon" title="View Profile" onClick={() => onViewProfile && onViewProfile(t._id)}><Eye size={14} /></button>
                        <button className="admin-btn-icon" onClick={() => openEdit(t)}><Pencil size={14} /></button>
                        <button className="admin-btn-icon" style={{color:'#ef4444'}} onClick={() => handleDelete(t._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Teacher' : 'Add New Teacher'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input className="admin-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input className="admin-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="teacher@college.edu" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Department</label>
                  <select className="admin-select" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Phone Number</label>
                  <input className="admin-input" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{editing ? 'Update' : 'Add Teacher'}</button>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
