import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, Eye } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  'Computer Science','Info Tech','Electronics','Electrical',
  'Mechanical','Civil','IoT','AI&DS','General'
];
const SECTIONS = ['A','B','C','D'];

export default function StudentManagement({ onViewProfile }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', batch:'', section:'A', phoneNumber:'' });

  useEffect(() => { fetchStudents(); }, [search, filterBatch]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterBatch !== 'all') params.batch = filterBatch;
      const { data } = await api.get('/admin/students', { params });
      setStudents(data);
    } catch { toast.error('Failed to fetch students'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name:'', email:'', batch:'', section:'A', phoneNumber:'' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    const parts = s.batch?.split(' - ');
    setForm({ name: s.name, email: s.email, batch: parts?.[0] || s.batch || '', section: parts?.[1] || 'A', phoneNumber: s.phoneNumber || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, batch: `${form.batch} - ${form.section}`, phoneNumber: form.phoneNumber };
    try {
      if (editing) {
        await api.put(`/admin/students/${editing._id}`, payload);
        toast.success('Student updated!');
      } else {
        await api.post('/admin/students', payload);
        toast.success('Student added!');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student and all their records?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Student deleted!');
      fetchStudents();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>👨‍🎓 Student Management</h1>
        <p>Add, edit, search and manage all students</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <div className="admin-search-box">
              <Search size={16} className="admin-search-icon" />
              <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="admin-select" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
              <option value="all">All Batches</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchStudents}><RefreshCw size={14} /> Refresh</button>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}><Plus size={16} /> Add Student</button>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : students.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">📭</div><p>No students found</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr>
                <th>Name</th><th>Email</th><th>Batch</th><th>Phone</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {students.map(s => {
                  const parts = s.batch?.split(' - ');
                  return (
                    <tr key={s._id}>
                      <td style={{fontWeight:600,color:'#fff'}}>{s.name}</td>
                      <td>{s.email}</td>
                      <td>
                        {parts?.[0] || s.batch}
                        {parts?.[1] && <span className="admin-badge admin-badge-student" style={{marginLeft:6}}>Sec {parts[1]}</span>}
                      </td>
                      <td>{s.phoneNumber || '-'}</td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="admin-btn-icon" title="View Profile" onClick={() => onViewProfile && onViewProfile(s._id)}><Eye size={14} /></button>
                          <button className="admin-btn-icon" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                          <button className="admin-btn-icon" style={{color:'#ef4444'}} onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input className="admin-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input className="admin-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@college.edu" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Batch / Class</label>
                  <select className="admin-select" required value={form.batch} onChange={e => setForm({...form, batch: e.target.value})}>
                    <option value="">-- Select --</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Section</label>
                  <select className="admin-select" value={form.section} onChange={e => setForm({...form, section: e.target.value})}>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Phone Number</label>
                <input className="admin-input" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="Optional" />
              </div>
              <div className="admin-modal-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{editing ? 'Update' : 'Add Student'}</button>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
