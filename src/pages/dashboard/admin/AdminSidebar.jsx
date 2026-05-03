import { LayoutDashboard, Users, GraduationCap, CalendarCheck, BarChart3, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'students', label: 'Students', icon: GraduationCap },
  { key: 'teachers', label: 'Teachers', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ activePage, setActivePage, onLogout, isOpen, onClose }) {
  return (
    <>
      <div className={`admin-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">A</div>
          <div>
            <div className="admin-sidebar-title">AMS Admin</div>
            <div className="admin-sidebar-subtitle">Management Panel</div>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`admin-nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => { setActivePage(item.key); onClose(); }}
            >
              <item.icon className="admin-nav-icon" size={20} />
              {item.label}
            </div>
          ))}
          <div className="admin-nav-divider" />
          <div className="admin-nav-item danger" onClick={onLogout}>
            <LogOut className="admin-nav-icon" size={20} />
            Logout
          </div>
        </nav>
      </aside>
    </>
  );
}
