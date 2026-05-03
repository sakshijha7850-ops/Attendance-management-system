import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CLASSES = [
  'Computer Science','Info Tech','Electronics','Electrical',
  'Mechanical','Civil','IoT','AI&DS','General'
];

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBatch, setFilterBatch] = useState('all');

  useEffect(() => { if (date) fetchAttendance(); }, [date, filterBatch]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { date };
      if (filterBatch !== 'all') params.batch = filterBatch;
      const { data } = await api.get('/admin/attendance', { params });
      setRecords(data);
    } catch { toast.error('Failed to fetch attendance'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/admin/attendance/${id}`, { status: newStatus });
      setRecords(prev => prev.map(r => r._id === id ? data : r));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update'); }
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <>
      <div className="admin-page-header">
        <h1>📅 Attendance Management</h1>
        <p>View and edit attendance records by date and class</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filter-bar">
            <input className="admin-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select className="admin-select" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
              <option value="all">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchAttendance}><RefreshCw size={14} /> Refresh</button>
          </div>
          <div style={{display:'flex',gap:12}}>
            <span className="admin-badge admin-badge-present">✓ {presentCount} Present</span>
            <span className="admin-badge admin-badge-absent">✗ {absentCount} Absent</span>
            <span className="admin-badge admin-badge-late">⏰ {lateCount} Late</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : records.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📭</div>
            <p>No attendance records found for this date</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr>
                <th>Student</th><th>Email</th><th>Batch</th><th>Subject</th><th>Status</th><th>Marked By</th><th>Action</th>
              </tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td style={{fontWeight:600,color:'#fff'}}>{r.student?.name || 'N/A'}</td>
                    <td>{r.student?.email || '-'}</td>
                    <td>{r.student?.batch || '-'}</td>
                    <td>{r.subject?.name || '-'}</td>
                    <td><span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.markedBy?.name || '-'}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={r.status}
                        onChange={e => handleStatusChange(r._id, e.target.value)}
                        style={{padding:'5px 8px',fontSize:12,minWidth:100}}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
