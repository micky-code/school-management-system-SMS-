import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './components/realtime';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateToken, getUserData } from './utils/authUtils';
import axios from 'axios';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import TestLogin from './pages/auth/TestLogin';

// Layout
import Layout from './components/layout/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
// Real-time features removed
import AcademicYears from './pages/admin/AcademicYears';
import MainPrograms from './pages/admin/MainPrograms';
import Programs from './pages/admin/Programs';
import Departments from './pages/admin/Departments';
import Majors from './pages/admin/Majors';
import Subjects from './pages/admin/Subjects';
import ManageSubjects from './pages/admin/ManageSubjects';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Enrollments from './pages/admin/Enrollments';
import Parents from './pages/admin/Parents';
import AdminSettings from './pages/admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSubjects from './pages/teacher/Subjects';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherExams from './pages/teacher/Exams';
import TeacherMarks from './pages/teacher/Marks';
import TeacherProfile from './pages/teacher/Profile';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentSubjects from './pages/student/Subjects';
import StudentSchedule from './pages/student/Schedule';
import StudentAttendance from './pages/student/Attendance';
import StudentExams from './pages/student/Exams';
import StudentMarks from './pages/student/Marks';
import StudentPayments from './pages/student/Payments';
import StudentProfile from './pages/student/Profile';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';

// Real-time Demo
import RealTimeDemo from './pages/RealTimeDemo';
import ParentChildren from './pages/parent/Children';
import ParentAttendance from './pages/parent/Attendance';
import ParentMarks from './pages/parent/Marks';
import ParentPayments from './pages/parent/Payments';
import ParentProfile from './pages/parent/Profile';

// Import isAuthenticated from authUtils
import { isAuthenticated } from './utils/authUtils';

// Login Check Component - Ensures users must log in first
const LoginCheck = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = window.location.pathname;
  
  // Skip login check for auth-related routes
  const authRoutes = ['/login', '/forgot-password', '/test-login'];
  if (authRoutes.some(route => location.startsWith(route))) {
    return children;
  }
  
  // Show loading while checking auth status
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('LoginCheck: User not authenticated, redirecting to login');
    // Store the current URL for redirect after login
    sessionStorage.setItem('redirectUrl', location);
    return <Navigate to="/login" replace={true} />;
  }
  
  // User is authenticated, render children
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles, fallbackPath }) => {
  const { currentUser } = useAuth();
  const pathname = window.location.pathname;
  
  // Log the current authentication state for debugging
  console.log('ProtectedRoute check:', {
    isAuthenticated: !!currentUser,
    currentUser,
    pathname,
    allowedRoles
  });
  
  // User is authenticated (LoginCheck already verified this), now check role permissions
  console.log('User authenticated, checking role permissions');
  
  // Validate user role against allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    // Get normalized role
    const userRole = (currentUser.role || '').toLowerCase();
    console.log('Current user role:', userRole);
    
    // Valid roles in our system
    const validRoles = ['admin', 'teacher', 'student', 'parent'];
    
    // If role is not valid, use admin as default
    const normalizedRole = validRoles.includes(userRole) ? userRole : 'admin';
    
    // Check if user role is allowed
    if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
      console.log(`User role ${normalizedRole} not allowed for this route. Allowed roles:`, allowedRoles);
      
      // Redirect to appropriate dashboard based on normalized role
      const dashboardPath = `/${normalizedRole}/dashboard`;
      console.log('Redirecting to dashboard:', dashboardPath);
      return <Navigate to={dashboardPath} replace={true} />;
    }
  }
  
  // If everything is valid, render the protected component
  return element;
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          <LoginCheck>
            <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-login" element={<TestLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
            {/* Real-time route removed */}
            <Route path="academic-years" element={<ProtectedRoute element={<AcademicYears />} allowedRoles={['admin']} />} />
            <Route path="main-programs" element={<ProtectedRoute element={<MainPrograms />} allowedRoles={['admin']} />} />
            <Route path="programs" element={<ProtectedRoute element={<Programs />} allowedRoles={['admin']} />} />
            <Route path="departments" element={<ProtectedRoute element={<Departments />} allowedRoles={['admin']} />} />
            <Route path="majors" element={<ProtectedRoute element={<Majors />} allowedRoles={['admin']} />} />
            <Route path="subjects" element={<ProtectedRoute element={<Subjects />} allowedRoles={['admin']} />} />
            <Route path="subject-assignment" element={<ProtectedRoute element={<ManageSubjects />} allowedRoles={['admin']} />} />
            <Route path="teachers" element={<ProtectedRoute element={<Teachers />} allowedRoles={['admin']} />} />
            <Route path="students" element={<ProtectedRoute element={<Students />} allowedRoles={['admin']} />} />
            <Route path="enrollments" element={<ProtectedRoute element={<Enrollments />} allowedRoles={['admin']} />} />
            <Route path="parents" element={<ProtectedRoute element={<Parents />} allowedRoles={['admin']} />} />
            <Route path="settings" element={<ProtectedRoute element={<AdminSettings />} allowedRoles={['admin']} />} />
            <Route path="realtime-demo" element={<ProtectedRoute element={<RealTimeDemo />} allowedRoles={['admin']} />} />
          </Route>
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute element={<TeacherDashboard />} allowedRoles={['teacher']} />} />
            <Route path="subjects" element={<ProtectedRoute element={<TeacherSubjects />} allowedRoles={['teacher']} />} />
            <Route path="schedule" element={<ProtectedRoute element={<TeacherSchedule />} allowedRoles={['teacher']} />} />
            <Route path="attendance" element={<ProtectedRoute element={<TeacherAttendance />} allowedRoles={['teacher']} />} />
            <Route path="exams" element={<ProtectedRoute element={<TeacherExams />} allowedRoles={['teacher']} />} />
            <Route path="marks" element={<ProtectedRoute element={<TeacherMarks />} allowedRoles={['teacher']} />} />
            <Route path="profile" element={<ProtectedRoute element={<TeacherProfile />} allowedRoles={['teacher']} />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="/student" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute element={<StudentDashboard />} allowedRoles={['student']} />} />
            <Route path="subjects" element={<ProtectedRoute element={<StudentSubjects />} allowedRoles={['student']} />} />
            <Route path="schedule" element={<ProtectedRoute element={<StudentSchedule />} allowedRoles={['student']} />} />
            <Route path="attendance" element={<ProtectedRoute element={<StudentAttendance />} allowedRoles={['student']} />} />
            <Route path="exams" element={<ProtectedRoute element={<StudentExams />} allowedRoles={['student']} />} />
            <Route path="marks" element={<ProtectedRoute element={<StudentMarks />} allowedRoles={['student']} />} />
            <Route path="payments" element={<ProtectedRoute element={<StudentPayments />} allowedRoles={['student']} />} />
            <Route path="profile" element={<ProtectedRoute element={<StudentProfile />} allowedRoles={['student']} />} />
          </Route>
          
          {/* Parent Routes */}
          <Route path="/parent" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute element={<ParentDashboard />} allowedRoles={['parent']} />} />
            <Route path="children" element={<ProtectedRoute element={<ParentChildren />} allowedRoles={['parent']} />} />
            <Route path="attendance" element={<ProtectedRoute element={<ParentAttendance />} allowedRoles={['parent']} />} />
            <Route path="marks" element={<ProtectedRoute element={<ParentMarks />} allowedRoles={['parent']} />} />
            <Route path="payments" element={<ProtectedRoute element={<ParentPayments />} allowedRoles={['parent']} />} />
            <Route path="profile" element={<ProtectedRoute element={<ParentProfile />} allowedRoles={['parent']} />} />
          </Route>
          
          {/* Root path always redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace={true} />} />
          
          {/* Catch-all route - always redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace={true} />} />
          
          </Routes>
          </LoginCheck>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
