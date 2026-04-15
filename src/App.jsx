import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
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

export default function App() {
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

        {/* new attendance page */}
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
