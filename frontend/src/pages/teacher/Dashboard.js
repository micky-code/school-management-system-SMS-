import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClockIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Import services
import DashboardService from '../../services/dashboard.service';
import TeacherService from '../../services/teacher.service';
import SubjectService from '../../services/subject.service';
import AttendanceService from '../../services/attendance.service';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    attendanceRate: 0,
    upcomingExams: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  useEffect(() => {
    if (currentUser?.id) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    try {
      // Create an array of promises for parallel data fetching
      const teacherId = currentUser?.id || 1; // Use 1 as fallback ID if currentUser is null
      
      // Load stats data
      try {
        console.log('Fetching teacher stats...');
        const statsData = await DashboardService.getTeacherStats(teacherId);
        console.log('Stats data received:', statsData);
        
        if (statsData && statsData._isMockData) {
          setUsingMockData(true);
        }
        
        setStats({
          totalSubjects: statsData?.subjects || 0,
          totalStudents: statsData?.students || 0,
          attendanceRate: statsData?.attendanceRate || 0,
          upcomingExams: statsData?.exams || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          totalSubjects: 0,
          totalStudents: 0,
          attendanceRate: 0,
          upcomingExams: 0
        });
      }
      
      // Load subjects data
      try {
        console.log('Fetching teacher subjects...');
        const subjectsData = await DashboardService.getTeacherSubjects(teacherId);
        console.log('Subjects data received:', subjectsData);
        
        if (subjectsData && subjectsData._isMockData) {
          setUsingMockData(true);
        }
        
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjects([]);
      }
      
      // Load attendance data
      try {
        console.log('Fetching attendance data...');
        const attendanceData = await DashboardService.getRecentAttendance(teacherId);
        console.log('Attendance data received:', attendanceData);
        
        if (attendanceData && attendanceData._isMockData) {
          setUsingMockData(true);
        }
        
        setRecentAttendance(attendanceData || []);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setRecentAttendance([]);
      }
      
      // Load events data
      try {
        console.log('Fetching events data...');
        const eventsData = await DashboardService.getUpcomingEvents(teacherId);
        console.log('Events data received:', eventsData);
        
        if (eventsData && eventsData._isMockData) {
          setUsingMockData(true);
        }
        
        setUpcomingEvents(eventsData || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setUpcomingEvents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in main fetchDashboardData function:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'exam':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-red-500" />;
      case 'deadline':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'meeting':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Error and loading state components
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
  
  const ErrorState = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {message || 'An error occurred while loading dashboard data. Please try again later.'}
          </p>
        </div>
      </div>
    </div>
  );
  
  const EmptyState = ({ icon, title, description }) => {
    const Icon = icon || ExclamationCircleIcon;
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <Icon className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Loading dashboard...</h1>
              <p className="mt-2 text-blue-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="hidden md:block">
              <AcademicCapIcon className="h-16 w-16 text-white opacity-50" />
            </div>
          </div>
        </div>
        
        <LoadingSpinner />
      </div>
    );
  }
  
  // If there's an error, show error state but continue to render dashboard with default values
  const hasError = error !== null;

  // Function to refresh dashboard data with visual feedback
  const refreshDashboard = () => {
    toast.info('Refreshing dashboard data...');
    fetchDashboardData();
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50">
      {usingMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Note:</span> Some data couldn't be loaded from the server. Showing sample data instead. 
                <button 
                  onClick={fetchDashboardData}
                  className="ml-2 text-yellow-700 underline hover:text-yellow-900"
                >
                  Retry
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name || 'Teacher'}</h1>
            <p className="mt-2 text-blue-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={refreshDashboard}
              className="mr-4 p-2 rounded-full hover:bg-blue-500 hover:bg-opacity-30 transition-colors duration-200"
              title="Refresh dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <div className="hidden md:block">
              <AcademicCapIcon className="h-16 w-16 text-white opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Subjects</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalSubjects}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.upcomingExams}</p>
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
            {subjects.length > 0 ? subjects.map(subject => (
              <div key={subject.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                      <span className="mr-3">{subject.code}</span>
                      <span className="mr-3">•</span>
                      <span className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" /> {subject.students} students
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center mb-1">
                      <ClockIcon className="h-4 w-4 mr-1" /> {subject.schedule}
                    </div>
                    <div className="flex justify-end">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {subject.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState 
                icon={BookOpenIcon}
                title="No subjects assigned"
                description="You don't have any subjects assigned to you yet. They will appear here once assigned."
              />
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BellAlertIcon className="h-5 w-5 mr-2 text-amber-600" /> Upcoming Events
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <div key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState 
                icon={CalendarIcon}
                title="No upcoming events"
                description="You don't have any upcoming events scheduled. Events will appear here when scheduled."
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" /> Recent Attendance
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => fetchDashboardData()} 
              className="p-1 rounded-full hover:bg-green-100 text-green-600" 
              title="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <Link to="/teacher/attendance" className="text-sm text-green-600 hover:text-green-800 font-medium">
              Manage Attendance
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentAttendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.map(record => {
                  const total = record.present + record.absent;
                  const rate = total > 0 ? Math.round((record.present / total) * 100) : 0;
                  
                  let statusColor = "";
                  if (rate >= 90) statusColor = "bg-green-100 text-green-800";
                  else if (rate >= 75) statusColor = "bg-yellow-100 text-yellow-800";
                  else statusColor = "bg-red-100 text-red-800";
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.present}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.absent}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{rate}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${rate >= 90 ? 'bg-green-600' : rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                          {rate >= 90 ? 'Excellent' : rate >= 75 ? 'Good' : 'Poor'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState 
              icon={CheckCircleIcon}
              title="No attendance records"
              description="You haven't recorded any attendance yet. Records will appear here once created."
            />
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/teacher/attendance" className="group flex flex-col items-center p-5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
              <div className="bg-blue-100 rounded-full p-3 mb-3 group-hover:bg-blue-200 transition-colors duration-300">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition-colors duration-300">Take Attendance</span>
            </Link>
            
            <Link to="/teacher/marks" className="group flex flex-col items-center p-5 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
              <div className="bg-green-100 rounded-full p-3 mb-3 group-hover:bg-green-200 transition-colors duration-300">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-800 transition-colors duration-300">Record Marks</span>
            </Link>
            
            <Link to="/teacher/schedule" className="group flex flex-col items-center p-5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
              <div className="bg-purple-100 rounded-full p-3 mb-3 group-hover:bg-purple-200 transition-colors duration-300">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-800 transition-colors duration-300">View Schedule</span>
            </Link>
            
            <Link to="/teacher/exams" className="group flex flex-col items-center p-5 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
              <div className="bg-amber-100 rounded-full p-3 mb-3 group-hover:bg-amber-200 transition-colors duration-300">
                <BookOpenIcon className="h-8 w-8 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-800 transition-colors duration-300">Manage Exams</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
