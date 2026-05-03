import { Search, Bell, Menu } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  students: 'Student Management',
  teachers: 'Teacher Management',
  attendance: 'Attendance Management',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  'student-profile': 'Student Profile',
  'teacher-profile': 'Teacher Profile',
};

export default function AdminTopbar({ activePage, user, onMenuToggle }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="admin-mobile-toggle" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <h2 className="admin-topbar-title">{PAGE_TITLES[activePage] || 'Dashboard'}</h2>
      </div>
      <div className="admin-topbar-right">
        <div className="admin-notif-btn">
          <Bell size={18} />
          <span className="admin-notif-badge" />
        </div>
        <div className="admin-profile-pill">
          <div className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <div className="admin-profile-name">{user?.name || 'Admin'}</div>
            <div className="admin-profile-role">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
