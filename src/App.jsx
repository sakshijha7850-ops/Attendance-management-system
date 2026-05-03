import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect, useRef, useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TakeAttendance from "./pages/dashboard/TakeAttendance";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MyCourses from "./pages/dashboard/MyCourses";
import MyAttendance from "./pages/dashboard/MyAttendance";
import Report from "./pages/dashboard/ReportWithMarks";
import Download from "./pages/dashboard/Download";
import GiveMarks from "./pages/GiveMarksWorking";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ✅ Duplicate tab screen
const DuplicateTabScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    padding: '20px'
  }}>
    <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
    <h2 style={{ color: '#333', marginBottom: '10px' }}>
     This app is already open in another tab.please use one tab
    </h2>
    <p style={{ color: '#666', marginBottom: '30px' }}>
     use only one tab.<br/>
     
    </p>
    <button
      onClick={() => window.close()}
      style={{
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer'
      }}
    >
     close this tab
    </button>
  </div>
);

export default function App() {
  const channelRef = useRef(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('app_tab');

    channelRef.current.onmessage = (e) => {
      if (e.data === 'new_tab_opened') {
        // ✅ Pehli tab par duplicate screen dikhao
        setIsDuplicate(true);
      }
    };

    const timer = setTimeout(() => {
      channelRef.current?.postMessage('new_tab_opened');
    }, 300);

    return () => {
      clearTimeout(timer);
      channelRef.current?.close();
    };
  }, []);

  // ✅ Agar duplicate tab hai toh locked screen dikhao
  if (isDuplicate) return <DuplicateTabScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/student-dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/my-courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyCourses />
          </ProtectedRoute>
        } />

        <Route path="/my-attendance" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyAttendance />
          </ProtectedRoute>
        } />

        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Report />
          </ProtectedRoute>
        } />

        <Route path="/download" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Download />
          </ProtectedRoute>
        } />

        <Route path="/teacher-dashboard" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/take-attendance" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TakeAttendance />
          </ProtectedRoute>
        } />

        <Route path="/give-marks" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <GiveMarks />
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}