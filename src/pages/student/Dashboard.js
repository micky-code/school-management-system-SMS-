import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import statsService from '../../services/stats.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthErrorMessage from '../../components/AuthErrorMessage';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = ({ authError }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    studentInfo: {
      name: '',
      id: '',
      program: '',
      year: 0,
      gpa: 0
    },
    currentCourses: [],
    upcomingAssignments: [],
    attendanceRecord: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0
    },
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get student ID from current user or use default
      const studentId = currentUser?.id || 1;
      console.log('Fetching student dashboard data for ID:', studentId);
      
      const response = await statsService.getStudentStats(studentId);
      
      console.log('Student dashboard data received:', response);
      
      if (response) {
        setStats(response.data || {});
        setIsMockData(response._isMockData || false);
        
        if (response._isMockData) {
          console.warn('Using mock data for student dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      
      // Check if this is an authentication error
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        // Don't redirect, just show auth error message in the component
        setError('Authentication error. Please log in again to view dashboard data.');
        // Set a flag in session storage to prevent future redirects
        sessionStorage.setItem('auth_error_shown', 'true');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);
  
  const handleRefresh = () => {
    toast.info('Refreshing dashboard data...');
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If auth error is passed from ProtectedRoute, show auth error message
  if (authError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col space-y-2 mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
        </div>
        <div className="flex items-center justify-between bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">Authentication error. Please log in again to view dashboard data.</span>
          </div>
          <button
            onClick={() => window.location.replace('/login')}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if this is an authentication error
    if (error.includes('Authentication error') || error.includes('session')) {
      return (
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col space-y-2 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
          </div>
          <div className="flex items-center justify-between bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={() => window.location.replace('/login')}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    
    // For other errors
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate attendance percentage
  const attendancePercentage = stats.attendanceRecord ? 
    Math.round((stats.attendanceRecord.present / stats.attendanceRecord.total) * 100) : 0;

  // Helper functions for rendering
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEventColor = (type) => {
    switch(type) {
      case 'academic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'career': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'extracurricular': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with student info */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
        <button 
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Refresh Dashboard"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mock data warning */}
      {isMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-yellow-700">
              <strong>Note:</strong> Displaying sample data. Connect to backend API for real-time data.
            </span>
            <button 
              onClick={handleRefresh}
              className="ml-4 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">{stats.studentInfo.name || 'Student Name'}</h2>
            </div>
            <p className="mt-2 opacity-90">Student ID: {stats.studentInfo.id || 'N/A'}</p>
            <p className="opacity-90">Program: {stats.studentInfo.program || 'N/A'}</p>
          </div>
          
          <div className="mt-4 md:mt-0 p-4 bg-white bg-opacity-20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <p className="text-sm opacity-80">Year</p>
                <p className="text-xl font-semibold">{stats.studentInfo.year || 'N/A'}</p>
              </div>
              <div className="h-10 w-px bg-white opacity-30"></div>
              <div className="text-center">
                <p className="text-sm opacity-80">GPA</p>
                <p className="text-xl font-semibold">{stats.studentInfo.gpa?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-blue-500" />
            Current Courses
          </h3>
          {stats.currentCourses && stats.currentCourses.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.currentCourses.map((course, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{course.name}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{course.code}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>Credits: {course.credits}</span>
                    <span>•</span>
                    <span>Grade: {course.grade || 'N/A'}</span>
                    <span>•</span>
                    <span>Attendance: {course.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BookOpenIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No courses found</p>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-green-500" />
            Attendance Summary
          </h3>

          {stats.attendanceRecord ? (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Overall Attendance</span>
                <span className="font-medium">{attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${attendancePercentage > 90 ? 'bg-green-600' : attendancePercentage > 75 ? 'bg-yellow-500' : 'bg-red-600'}`} 
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Present</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.attendanceRecord.present}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-gray-600">Absent</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.attendanceRecord.absent}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-600">Late</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.attendanceRecord.late}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600">Excused</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.attendanceRecord.excused}</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link 
                  to="/student/attendance" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View Full Attendance History →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No attendance records found</p>
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Upcoming Assignments
          </h3>
          
          {stats.upcomingAssignments && stats.upcomingAssignments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.upcomingAssignments.map((assignment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.course}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-gray-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No upcoming assignments</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
            Upcoming Events
          </h3>
          
          {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.upcomingEvents.map((event, index) => {
                const eventColor = getEventColor(event.type);
                return (
                  <div 
                    key={index} 
                    className={`border-l-4 p-4 rounded-r-lg ${eventColor}`}
                  >
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="mt-2 flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
