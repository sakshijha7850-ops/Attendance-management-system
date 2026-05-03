import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, BookOpen } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  'Computer Science','Info Tech','Electronics','Electrical',
  'Mechanical','Civil','IoT','AI&DS','General'
];
const SECTIONS = ['A','B','C','D'];
const TYPES = ['THEORY','LAB','PRACTICAL'];

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', code:'', type:'THEORY', batch:'', section:'A', teacher:'' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, teacherRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/admin/teachers'),
      ]);
      setSubjects(subRes.data);
      setTeachers(teacherRes.data);
    } catch { toast.error('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const filtered = subjects.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.batch?.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name:'', code:'', type:'THEORY', batch:'', section:'A', teacher:'' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    const parts = s.batch?.split(' - ');
    setForm({
      name: s.name,
      code: s.code || '',
      type: s.type || 'THEORY',
      batch: parts?.[0] || s.batch || '',
      section: parts?.[1] || 'A',
      teacher: s.teacher?._id || s.teacher || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.batch || !form.teacher) {
      return toast.error('Please fill all required fields');
    }
    const payload = {
      name: form.name,
      code: form.code,
      type: form.type,
      batch: `${form.batch} - ${form.section}`,
    };
    try {
      if (editing) {
        await api.put(`/admin/subjects/${editing._id}`, { ...payload, teacher: form.teacher });
        toast.success('Subject updated!');
      } else {
        // Create subject via admin endpoint
        await api.post(`/admin/subjects`, { ...payload, teacher: form.teacher });
        toast.success('Subject created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? All attendance for this subject will also be deleted.')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      toast.success('Subject deleted!');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'LAB': return { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
      case 'PRACTICAL': return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' };
      default: return { bg: 'rgba(16,185,129,0.12)', color: '#10b981' };
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>📚 Subject Management</h1>
        <p>Create, assign, and manage subjects across all classes</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <div className="admin-search-box">
              <Search size={16} className="admin-search-icon" />
              <input placeholder="Search by name, code or batch..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}><Plus size={16} /> Add Subject</button>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">📭</div><p>No subjects found</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr>
                <th>Subject</th><th>Code</th><th>Type</th><th>Batch</th><th>Teacher</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const tc = getTypeColor(s.type);
                  return (
                    <tr key={s._id}>
                      <td style={{fontWeight:600,color:'#fff'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <BookOpen size={16} style={{color:'#6366f1'}} />
                          {s.name}
                        </div>
                      </td>
                      <td><span style={{color:'#94a3b8',fontFamily:'monospace'}}>{s.code || '-'}</span></td>
                      <td>
                        <span style={{padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,background:tc.bg,color:tc.color}}>
                          {s.type}
                        </span>
                      </td>
                      <td>{s.batch}</td>
                      <td style={{color:'#94a3b8'}}>{s.teacher?.name || 'Unassigned'}</td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
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
            <h3>{editing ? 'Edit Subject' : 'Add New Subject'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Subject Name *</label>
                  <input className="admin-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Data Structures" />
                </div>
                <div className="admin-form-group">
                  <label>Subject Code</label>
                  <input className="admin-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. CS301" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Type</label>
                <select className="admin-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Batch / Class *</label>
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
                <label>Assign Teacher *</label>
                <select className="admin-select" required value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})}>
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{editing ? 'Update' : 'Add Subject'}</button>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
