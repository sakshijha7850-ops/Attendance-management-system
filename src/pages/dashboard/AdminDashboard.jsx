import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminTopbar from './admin/AdminTopbar';
import DashboardHome from './admin/DashboardHome';
import StudentManagement from './admin/StudentManagement';
import TeacherManagement from './admin/TeacherManagement';
import AttendanceManagement from './admin/AttendanceManagement';
import ReportsAnalytics from './admin/ReportsAnalytics';
import AdminSettings from './admin/AdminSettings';
import StudentProfile from './admin/StudentProfile';
import TeacherProfile from './admin/TeacherProfile';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileView, setProfileView] = useState(null); // { type: 'student'|'teacher', id: '...' }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewStudentProfile = (id) => {
    setProfileView({ type: 'student', id });
  };

  const handleViewTeacherProfile = (id) => {
    setProfileView({ type: 'teacher', id });
  };

  const handleBackFromProfile = () => {
    setProfileView(null);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setProfileView(null); // Clear profile view when changing pages
  };

  const renderPage = () => {
    // If viewing a profile, show the profile page
    if (profileView) {
      if (profileView.type === 'student') {
        return <StudentProfile studentId={profileView.id} onBack={handleBackFromProfile} />;
      }
      if (profileView.type === 'teacher') {
        return <TeacherProfile teacherId={profileView.id} onBack={handleBackFromProfile} />;
      }
    }

    switch (activePage) {
      case 'students': return <StudentManagement onViewProfile={handleViewStudentProfile} />;
      case 'teachers': return <TeacherManagement onViewProfile={handleViewTeacherProfile} />;
      case 'attendance': return <AttendanceManagement />;
      case 'reports': return <ReportsAnalytics />;
      case 'settings': return <AdminSettings />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="admin-main">
        <AdminTopbar
          activePage={profileView ? `${profileView.type}-profile` : activePage}
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="admin-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}