import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, CalendarCheck, Award, Clock, UserCheck, UserX } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function TeacherProfile({ teacherId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [teacherId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: profile } = await api.get(`/admin/teachers/${teacherId}/profile`);
      setData(profile);
    } catch (err) {
      toast.error('Failed to load teacher profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!data) return <div className="admin-empty"><p>Failed to load profile</p></div>;

  const { teacher, subjects, attendance, marks, totalStudentsTaught } = data;
  const pieData = [
    { name: 'Present', value: attendance.presentMarked || 0 },
    { name: 'Absent', value: attendance.absentMarked || 0 },
    { name: 'Late', value: attendance.lateMarked || 0 },
  ].filter(d => d.value > 0);

  // Group marks by subject for summary
  const marksBySubject = {};
  marks.forEach(m => {
    if (!marksBySubject[m.subject]) {
      marksBySubject[m.subject] = { total: 0, count: 0, students: [] };
    }
    marksBySubject[m.subject].total += m.marks;
    marksBySubject[m.subject].count += 1;
    marksBySubject[m.subject].students.push(m);
  });

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <button className="admin-btn admin-btn-outline" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Teachers
        </button>
      </div>

      {/* Profile Header */}
      <div className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: '#fff', flexShrink: 0
          }}>
            {teacher.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
              {teacher.name}
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#8b949e' }}>
              {teacher.email}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span className="admin-badge admin-badge-teacher">Teacher</span>
              <span className="admin-badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                {teacher.batch || 'General'}
              </span>
              {teacher.phoneNumber && (
                <span className="admin-badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  📞 {teacher.phoneNumber}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              textAlign: 'center', padding: '12px 20px', background: 'rgba(139,92,246,0.08)',
              borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)', minWidth: '100px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa' }}>
                {subjects.length}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Subjects</div>
            </div>
            <div style={{
              textAlign: 'center', padding: '12px 20px', background: 'rgba(59,130,246,0.08)',
              borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', minWidth: '100px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#60a5fa' }}>
                {totalStudentsTaught}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
        {['overview', 'subjects', 'marks', 'attendance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px',
              background: activeTab === tab ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.15))' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'inherit', textTransform: 'capitalize',
              border: activeTab === tab ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="admin-stat-card purple">
              <div className="admin-stat-icon purple"><BookOpen size={22} /></div>
              <div className="admin-stat-info"><p>Subjects</p><h3>{subjects.length}</h3></div>
            </div>
            <div className="admin-stat-card blue">
              <div className="admin-stat-icon blue"><Users size={22} /></div>
              <div className="admin-stat-info"><p>Students Taught</p><h3>{totalStudentsTaught}</h3></div>
            </div>
            <div className="admin-stat-card green">
              <div className="admin-stat-icon green"><CalendarCheck size={22} /></div>
              <div className="admin-stat-info"><p>Attendance Marked</p><h3>{attendance.totalMarked}</h3></div>
            </div>
            <div className="admin-stat-card amber">
              <div className="admin-stat-icon amber"><Award size={22} /></div>
              <div className="admin-stat-info"><p>Marks Given</p><h3>{marks.length}</h3></div>
            </div>
          </div>

          <div className="admin-two-col">
            {/* Attendance Pie */}
            <div className="admin-card">
              <div className="admin-card-header"><h3>📊 Attendance Marked Distribution</h3></div>
              <div className="admin-chart-container">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="admin-empty"><div className="admin-empty-icon">📭</div><p>No attendance data</p></div>
                )}
              </div>
            </div>

            {/* Subjects Quick View */}
            <div className="admin-card">
              <div className="admin-card-header"><h3>📚 Assigned Subjects</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                {subjects.length > 0 ? subjects.map(s => (
                  <div key={s._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {s.batch} {s.code && `• ${s.code}`}
                      </div>
                    </div>
                    <span className="admin-badge" style={{
                      background: s.type === 'LAB' || s.type === 'PRACTICAL'
                        ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                      color: s.type === 'LAB' || s.type === 'PRACTICAL'
                        ? '#f59e0b' : '#3b82f6',
                    }}>
                      {s.type}
                    </span>
                  </div>
                )) : (
                  <div className="admin-empty"><div className="admin-empty-icon">📚</div><p>No subjects assigned</p></div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📚 All Subjects</h3>
            <span className="admin-badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
              {subjects.length} subjects
            </span>
          </div>
          {subjects.length === 0 ? (
            <div className="admin-empty"><div className="admin-empty-icon">📚</div><p>No subjects assigned</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>Subject Name</th><th>Code</th><th>Class/Batch</th><th>Type</th><th>Created</th>
                </tr></thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={s._id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{s.name}</td>
                      <td>{s.code || '-'}</td>
                      <td>
                        <span className="admin-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                          {s.batch}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge" style={{
                          background: s.type === 'LAB' || s.type === 'PRACTICAL' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                          color: s.type === 'LAB' || s.type === 'PRACTICAL' ? '#f59e0b' : '#3b82f6',
                        }}>{s.type}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📝 Marks Assigned</h3>
            <span className="admin-badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              {marks.length} records
            </span>
          </div>

          {/* Subject-wise Summary */}
          {Object.keys(marksBySubject).length > 0 && (
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(marksBySubject).map(([subj, info]) => (
                <div key={subj} style={{
                  padding: '12px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', minWidth: '150px'
                }}>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{subj}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {info.count} students • Avg: {(info.total / info.count).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {marks.length === 0 ? (
            <div className="admin-empty"><div className="admin-empty-icon">📝</div><p>No marks assigned</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>Student</th><th>Subject</th><th>Exam</th><th>Marks</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {marks.map((m, i) => {
                    const maxMarks = m.outOf || (m.examType === 'Major' ? 30 : 25);
                    const pct = (m.marks / maxMarks) * 100;
                    return (
                    <tr key={m._id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{m.student?.name || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{m.student?.batch || ''}</div>
                      </td>
                      <td>{m.subject}</td>
                      <td>
                        <span className="admin-badge" style={{
                          background: m.examType === 'Major' ? 'rgba(168,85,247,0.12)' : 'rgba(59,130,246,0.12)',
                          color: m.examType === 'Major' ? '#a855f7' : '#60a5fa',
                        }}>
                          {m.examType || 'Exam'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '13px',
                          background: pct >= 80 ? 'rgba(16,185,129,0.12)' : pct >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                        }}>
                          {m.marks}/{maxMarks}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📅 Attendance Records Marked</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="admin-badge admin-badge-present">{attendance.presentMarked} Present</span>
              <span className="admin-badge admin-badge-absent">{attendance.absentMarked} Absent</span>
              <span className="admin-badge admin-badge-late">{attendance.lateMarked} Late</span>
            </div>
          </div>
          {attendance.records?.length === 0 ? (
            <div className="admin-empty"><div className="admin-empty-icon">📅</div><p>No attendance records</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>Date</th><th>Student</th><th>Subject</th><th>Batch</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {attendance.records?.map((r, i) => (
                    <tr key={r._id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 500, color: '#fff' }}>{r.student?.name || '-'}</td>
                      <td>{r.subject?.name || '-'}</td>
                      <td>
                        <span className="admin-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                          {r.subject?.batch || r.student?.batch || '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${r.status}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
