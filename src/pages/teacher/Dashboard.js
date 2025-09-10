import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import statsService from '../../services/stats.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthErrorMessage from '../../components/AuthErrorMessage';
import { 
  AcademicCapIcon, 
  UserGroupIcon,
  BookOpenIcon, 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Dashboard = ({ authError }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [teacherData, setTeacherData] = useState({
    teacherInfo: {
      name: '',
      id: '',
      department: '',
      position: '',
      joinDate: ''
    },
    stats: {
      subjects: 0,
      students: 0,
      attendanceRate: 0,
      exams: 0
    },
    subjects: [],
    recentAttendance: [],
    upcomingEvents: []
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get teacher ID from current user or use default
      const teacherId = currentUser?.id || 1;
      console.log('Fetching teacher dashboard data for ID:', teacherId);
      
      const response = await statsService.getTeacherStats(teacherId);
      
      console.log('Teacher dashboard data received:', response);
      
      if (response) {
        setTeacherData(response.data || {});
        setIsMockData(response._isMockData || false);
        
        if (response._isMockData) {
          console.warn('Using mock data for teacher dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
      
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
  
  const handleRefresh = () => {
    toast.info('Refreshing dashboard data...');
    fetchDashboardData();
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'exam':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-red-500" />;
      case 'meeting':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
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
            <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
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

  const {
    teacherInfo = {},
    stats = {},
    subjects = [],
    recentAttendance = [],
    upcomingEvents = []
  } = teacherData || {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Mock Data Warning */}
      {isMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
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

      {/* Teacher Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {teacherInfo?.name || 'Teacher'}</h1>
            <p className="mt-2 text-blue-100">
              {teacherInfo?.department || 'Department'} | ID: {teacherInfo?.id || 'N/A'}
            </p>
            <p className="mt-1 text-blue-100">Position: {teacherInfo?.position || 'N/A'}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleRefresh}
              className="mr-4 p-2 rounded-full hover:bg-blue-500 hover:bg-opacity-30 transition-colors"
              title="Refresh dashboard"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <div className="hidden md:block">
              <AcademicCapIcon className="h-16 w-16 text-white opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <BookOpenIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Subjects</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.subjects}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <UserGroupIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Students</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.students}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <CheckCircleIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.exams}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects */}
        <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" /> My Subjects
            </h2>
            <Link to="/teacher/subjects" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {subjects && subjects.length > 0 ? (
              subjects.filter(subj => subj && typeof subj === 'object').map((subject, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{subject?.name || 'Subject'}</h3>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                        <span className="mr-3">{subject?.code || '-'}</span>
                        <span className="mr-3">•</span>
                        <span className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" /> {subject?.students || 0} students
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <ClockIcon className="h-4 w-4 mr-1" /> {subject?.schedule || 'TBD'}
                      </div>
                      <div className="flex justify-between">
                        <span className="mr-2">Attendance: {subject.attendance}%</span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Avg: {subject?.averageGrade || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <BookOpenIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No subjects assigned yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any subjects assigned to you at the moment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-amber-600" /> Upcoming Events
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {teacherData.upcomingEvents && teacherData.upcomingEvents.length > 0 ? (
              teacherData.upcomingEvents.filter(evt => evt && typeof evt === 'object').map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{event?.title || 'Untitled Event'}</h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(event?.date)}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500">
                          Location: {event?.location || 'TBD'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any events scheduled in the near future.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" /> Recent Attendance
          </h2>
          <Link to="/teacher/attendance" className="text-sm text-green-600 hover:text-green-800 font-medium">
            Manage Attendance
          </Link>
        </div>
        <div className="overflow-x-auto">
          {teacherData.recentAttendance && teacherData.recentAttendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherData.recentAttendance.map((record, index) => {
                  const rate = record.total > 0 ? Math.round((record.present / record.total) * 100) : 0;
                  let statusClass = "bg-green-100 text-green-800";
                  
                  if (rate < 75) {
                    statusClass = "bg-red-100 text-red-800";
                  } else if (rate < 90) {
                    statusClass = "bg-yellow-100 text-yellow-800";
                  }
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.total}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.present}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.absent}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                          {record.status || (rate >= 90 ? 'Excellent' : rate >= 75 ? 'Good' : 'Poor')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center">
              <CheckCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no recent attendance records to display.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" /> Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <Link to="/teacher/attendance" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            <span className="font-medium">Take Attendance</span>
          </Link>
          <Link to="/teacher/grades" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mr-3" />
            <span className="font-medium">Record Grades</span>
          </Link>
          <Link to="/teacher/exams" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center">
            <CalendarIcon className="h-6 w-6 text-orange-600 mr-3" />
            <span className="font-medium">Schedule Exams</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
