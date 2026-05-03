import { useState, useEffect } from 'react';
import { ArrowLeft, User, BookOpen, Award, CalendarCheck, TrendingUp, Clock, UserX, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function StudentProfile({ studentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: profile } = await api.get(`/admin/students/${studentId}/profile`);
      setData(profile);
    } catch (err) {
      toast.error('Failed to load student profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!data) return <div className="admin-empty"><p>Failed to load profile</p></div>;

  const { student, attendance, marks } = data;
  const pieData = [
    { name: 'Present', value: attendance.present || 0 },
    { name: 'Absent', value: attendance.absent || 0 },
    { name: 'Late', value: attendance.late || 0 },
  ].filter(d => d.value > 0);

  const avgMarks = marks.length > 0
    ? (marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(1)
    : '0';

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <button className="admin-btn admin-btn-outline" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Students
        </button>
      </div>

      {/* Profile Header */}
      <div className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: '#fff', flexShrink: 0
          }}>
            {student.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
              {student.name}
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#8b949e' }}>
              {student.email}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span className="admin-badge admin-badge-student">Student</span>
              <span className="admin-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                {student.batch || 'General'}
              </span>
              {student.phoneNumber && (
                <span className="admin-badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  📞 {student.phoneNumber}
                </span>
              )}
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap'
          }}>
            <div style={{
              textAlign: 'center', padding: '12px 20px', background: 'rgba(16,185,129,0.08)',
              borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)', minWidth: '100px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                {attendance.percentage}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Attendance</div>
            </div>
            <div style={{
              textAlign: 'center', padding: '12px 20px', background: 'rgba(99,102,241,0.08)',
              borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', minWidth: '100px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#818cf8' }}>
                {avgMarks}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Avg Marks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
        {['overview', 'marks', 'attendance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px',
              background: activeTab === tab ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'inherit', textTransform: 'capitalize',
              border: activeTab === tab ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent'
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
            <div className="admin-stat-card green">
              <div className="admin-stat-icon green"><UserCheck size={22} /></div>
              <div className="admin-stat-info"><p>Present</p><h3>{attendance.present}</h3></div>
            </div>
            <div className="admin-stat-card red">
              <div className="admin-stat-icon red"><UserX size={22} /></div>
              <div className="admin-stat-info"><p>Absent</p><h3>{attendance.absent}</h3></div>
            </div>
            <div className="admin-stat-card amber">
              <div className="admin-stat-icon amber"><Clock size={22} /></div>
              <div className="admin-stat-info"><p>Late</p><h3>{attendance.late}</h3></div>
            </div>
            <div className="admin-stat-card blue">
              <div className="admin-stat-icon blue"><BookOpen size={22} /></div>
              <div className="admin-stat-info"><p>Total Classes</p><h3>{attendance.totalClasses}</h3></div>
            </div>
          </div>

          {/* Charts */}
          <div className="admin-two-col">
            <div className="admin-card">
              <div className="admin-card-header"><h3>📊 Attendance Distribution</h3></div>
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

            <div className="admin-card">
              <div className="admin-card-header"><h3>🏆 Marks Summary</h3></div>
              <div style={{ padding: '16px 0' }}>
                {marks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {marks.slice(0, 6).map((m, i) => {
                      const maxMarks = m.outOf || (m.examType === 'Major' ? 30 : 25);
                      const pct = (m.marks / maxMarks) * 100;
                      const barColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                      const examBadge = m.examType === 'Major' ? '🎓' : m.examType === 'Minor 2' ? '📋' : '📝';
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
                              {examBadge} {m.subject} <span style={{ fontSize: '11px', color: '#64748b' }}>({m.examType || 'Exam'})</span>
                            </span>
                            <span style={{ fontSize: '13px', color: barColor, fontWeight: '700' }}>{m.marks}/{maxMarks}</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: '4px',
                              background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                              transition: 'width 0.8s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-empty"><div className="admin-empty-icon">📝</div><p>No marks assigned yet</p></div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📝 All Marks</h3>
            <span className="admin-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
              {marks.length} records
            </span>
          </div>
          {marks.length === 0 ? (
            <div className="admin-empty"><div className="admin-empty-icon">📝</div><p>No marks found</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>Subject</th><th>Exam</th><th>Marks</th><th>Teacher</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {marks.map((m, i) => {
                    const maxMarks = m.outOf || (m.examType === 'Major' ? 30 : 25);
                    const pct = (m.marks / maxMarks) * 100;
                    return (
                    <tr key={m._id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{m.subject}</td>
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
                      <td>{m.teacher?.name || '-'}</td>
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
            <h3>📅 Attendance Records</h3>
            <span className="admin-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              {attendance.percentage}% Overall
            </span>
          </div>
          {attendance.records?.length === 0 ? (
            <div className="admin-empty"><div className="admin-empty-icon">📅</div><p>No attendance records found</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>#</th><th>Date</th><th>Subject</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {attendance.records?.map((r, i) => (
                    <tr key={r._id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{r.subject?.name || '-'}</td>
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
