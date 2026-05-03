import { useEffect, useState } from 'react';
import { GraduationCap, Users, UserCheck, UserX, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../../services/api';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard-stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!stats) return <div className="admin-empty"><p>Failed to load dashboard</p></div>;

  const pieData = [
    { name: 'Present', value: stats.presentToday || 0 },
    { name: 'Absent', value: stats.absentToday || 0 },
    { name: 'Late', value: stats.lateToday || 0 },
  ].filter(d => d.value > 0);

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'blue' },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'purple' },
    { label: 'Present Today', value: stats.presentToday, icon: UserCheck, color: 'green' },
    { label: 'Absent Today', value: stats.absentToday, icon: UserX, color: 'red' },
    { label: 'Total Classes', value: stats.totalClasses, icon: BookOpen, color: 'amber' },
  ];

  return (
    <>
      <div className="admin-page-header">
        <h1>Welcome Back, Admin 👋</h1>
        <p>Here's what's happening in your institution today</p>
      </div>

      <div className="admin-stats-grid">
        {cards.map(c => (
          <div key={c.label} className={`admin-stat-card ${c.color}`}>
            <div className={`admin-stat-icon ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="admin-stat-info">
              <p>{c.label}</p>
              <h3>{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-two-col">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📊 Weekly Attendance Trend</h3>
          </div>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyBreakdown || []}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4,4,0,0]} name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" radius={[4,4,0,0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>🥧 Today's Attendance</h3>
          </div>
          <div className="admin-chart-container">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-empty">
                <div className="admin-empty-icon">📭</div>
                <p>No attendance data for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
