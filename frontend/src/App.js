import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import TestLogin from './pages/auth/TestLogin';

// Layout
import Layout from './components/layout/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AcademicYears from './pages/admin/AcademicYears';
import MainPrograms from './pages/admin/MainPrograms';
import Departments from './pages/admin/Departments';
import Majors from './pages/admin/Majors';
import Subjects from './pages/admin/Subjects';
import ManageSubjects from './pages/admin/ManageSubjects';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
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
import ParentChildren from './pages/parent/Children';
import ParentAttendance from './pages/parent/Attendance';
import ParentMarks from './pages/parent/Marks';
import ParentPayments from './pages/parent/Payments';
import ParentProfile from './pages/parent/Profile';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  try {
    // In a real implementation, we would decode the token and check the role
    // For now, we'll just allow access if there's a token
    return element;
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-login" element={<TestLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
            <Route path="academic-years" element={<ProtectedRoute element={<AcademicYears />} allowedRoles={['admin']} />} />
            <Route path="programs" element={<ProtectedRoute element={<MainPrograms />} allowedRoles={['admin']} />} />
            <Route path="departments" element={<ProtectedRoute element={<Departments />} allowedRoles={['admin']} />} />
            <Route path="majors" element={<ProtectedRoute element={<Majors />} allowedRoles={['admin']} />} />
            <Route path="subjects" element={<ProtectedRoute element={<Subjects />} allowedRoles={['admin']} />} />
            <Route path="subject-assignment" element={<ProtectedRoute element={<ManageSubjects />} allowedRoles={['admin']} />} />
            <Route path="teachers" element={<ProtectedRoute element={<Teachers />} allowedRoles={['admin']} />} />
            <Route path="students" element={<ProtectedRoute element={<Students />} allowedRoles={['admin']} />} />
            <Route path="parents" element={<ProtectedRoute element={<Parents />} allowedRoles={['admin']} />} />
            <Route path="settings" element={<ProtectedRoute element={<AdminSettings />} allowedRoles={['admin']} />} />
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
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
