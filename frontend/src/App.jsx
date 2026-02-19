import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import LevelManagement from './pages/admin/LevelManagement';
import Statistics from './pages/admin/Statistics';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import GradeManagement from './pages/teacher/GradeManagement';
import AttendanceManagement from './pages/teacher/AttendanceManagement';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentGrades from './pages/student/StudentGrades';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentCertificates from './pages/student/StudentCertificates';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProgress from './pages/parent/ChildProgress';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Page Wrappers with Layout
const AdminLayout = ({ children, title }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    <Layout title={title}>
      {children}
    </Layout>
  </ProtectedRoute>
);

const TeacherLayout = ({ children, title }) => (
  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
    <Layout title={title}>
      {children}
    </Layout>
  </ProtectedRoute>
);

const StudentLayout = ({ children, title }) => (
  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
    <Layout title={title}>
      {children}
    </Layout>
  </ProtectedRoute>
);

const ParentLayout = ({ children, title }) => (
  <ProtectedRoute allowedRoles={['admin', 'parent']}>
    <Layout title={title}>
      {children}
    </Layout>
  </ProtectedRoute>
);

// Redirect based on role
const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    case 'parent':
      return <Navigate to="/parent" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin/levels" element={<AdminLayout><LevelManagement /></AdminLayout>} />
          <Route path="/admin/statistics" element={<AdminLayout><Statistics /></AdminLayout>} />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
          <Route path="/teacher/grades" element={<TeacherLayout><GradeManagement /></TeacherLayout>} />
          <Route path="/teacher/attendance" element={<TeacherLayout><AttendanceManagement /></TeacherLayout>} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
          <Route path="/student/grades" element={<StudentLayout><StudentGrades /></StudentLayout>} />
          <Route path="/student/attendance" element={<StudentLayout><StudentAttendance /></StudentLayout>} />
          <Route path="/student/certificates" element={<StudentLayout><StudentCertificates /></StudentLayout>} />
          
          {/* Parent Routes */}
          <Route path="/parent" element={<ParentLayout><ParentDashboard /></ParentLayout>} />
          <Route path="/parent/child" element={<ParentLayout><ChildProgress /></ParentLayout>} />
          
          {/* Default Redirect */}
          <Route path="/" element={<RoleRedirect />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
