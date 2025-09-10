import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  UserIcon, 
  BookOpenIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import statsService from '../../services/stats.service';
import { toast } from 'react-toastify';
import DashboardConnectionStatus from '../../components/DashboardConnectionStatus';
import AuthErrorMessage from '../../components/AuthErrorMessage';

const Dashboard = ({ authError }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalPrograms: 0,
    recentEnrollments: 0,
    currentYear: '',
    studentsByProgram: [],
    recentActivity: []
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [refreshIntervalOptions] = useState([10, 30, 60, 300]); // 10s, 30s, 1min, 5min
  const refreshTimerRef = useRef(null);
  // API connection status
  const [apiConnected, setApiConnected] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await statsService.getAdminDashboardStats();
      
      if (response.isMockData) {
        console.log('Using mock data');
        setIsMockData(true);
      } else {
        console.log('Using API data');
        setIsMockData(false);
      }

      // Data is already normalized by the stats service
      console.log('Setting pre-normalized stats:', response);
      setStats(response);
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
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

  // Setup auto-refresh
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Handle auto-refresh changes
  useEffect(() => {
    if (autoRefresh) {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      
      // Set up new timer
      refreshTimerRef.current = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval * 1000);
    } else {
      // Clear timer when auto-refresh is disabled
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  const handleRefresh = () => {
    // Fetch fresh data via API
    fetchDashboardData();
    toast.info('Refreshing dashboard data...');
  };
  
  // Handle connection status change from DashboardConnectionStatus component
  const handleConnectionStatusChange = (status) => {
    setApiConnected(status.apiConnected);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  const handleRefreshIntervalChange = (seconds) => {
    setRefreshInterval(seconds);
    if (autoRefresh) {
      // Reset the timer with new interval
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = setInterval(fetchDashboardData, seconds * 1000);
    }
  };

  // Format date for activity timestamps
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      count: stats.totalStudents,
      icon: <UserGroupIcon className="h-8 w-8 text-blue-500" />,
      link: '/admin/students',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Students',
      count: stats.activeStudents,
      icon: <UserIcon className="h-8 w-8 text-green-500" />,
      link: '/admin/students',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Teachers',
      count: stats.totalTeachers,
      icon: <UserIcon className="h-8 w-8 text-purple-500" />,
      link: '/admin/teachers',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Programs',
      count: stats.totalPrograms,
      icon: <BuildingOfficeIcon className="h-8 w-8 text-yellow-500" />,
      link: '/admin/programs',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Recent Enrollments',
      count: stats.recentEnrollments,
      icon: <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-500" />,
      link: '/admin/enrollments',
      bgColor: 'bg-indigo-100'
    }
  ];

  // formatDate function is defined above

  // If auth error is passed from ProtectedRoute, show auth error message
  if (authError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className={`p-6 rounded-lg shadow-sm ${card.bgColor || 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
                <div className="p-3 rounded-full bg-white bg-opacity-80">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            {stats.currentYear && (
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-1" />
                <span>Academic Year: <span className="font-semibold">{stats.currentYear}</span></span>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-5 w-5 mr-1" />
                <span>Last updated: <span className="font-semibold">{lastUpdated.toLocaleTimeString()}</span></span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Connection Status Component */}
        <DashboardConnectionStatus 
          onConnectionChange={(status) => {
            if (status.interval) {
              setRefreshInterval(status.interval);
            }
          }} 
          autoRefreshInterval={refreshInterval}
        />
      </div>

      {error && (
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
      )}
      
      {isMockData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span>Using mock data. Real-time database connection unavailable.</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-yellow-600">
              {lastUpdated && `Last attempt: ${lastUpdated.toLocaleTimeString()}`}
            </div>
            <button 
              onClick={handleRefresh}
              className="ml-4 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-2 rounded flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.bgColor} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full mr-4">{card.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{card.count}</h3>
                <p className="text-sm font-medium">{card.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/students/add"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-blue-700">Add Student</span>
            </Link>
            <Link
              to="/admin/teachers/add"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <AcademicCapIcon className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-purple-700">Add Teacher</span>
            </Link>
            <Link
              to="/admin/courses"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BookOpenIcon className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-green-700">Manage Courses</span>
            </Link>
            <Link
              to="/admin/attendance"
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <CalendarDaysIcon className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-yellow-700">Attendance</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link to="/admin/activity" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <LoadingSpinner />
            </div>
          ) : stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start border-b pb-3 last:border-0">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.name}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="animate-pulse flex items-center">
                <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                <span className="text-blue-500">Updating...</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Students by Program</h3>
            <BookOpenIcon className="h-6 w-6 text-blue-500" />
          </div>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <LoadingSpinner />
            </div>
          ) : stats.studentsByProgram && stats.studentsByProgram.length > 0 ? (
            <div className="space-y-3">
              {stats.studentsByProgram.map((program) => (
                <div key={program.id} className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{program.program_name}</span>
                      <span className="text-sm font-semibold">{program.student_count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (program.student_count / Math.max(...stats.studentsByProgram.map(p => p.student_count))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No program data available</div>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="animate-pulse flex items-center">
                <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                <span className="text-blue-500">Updating...</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">System Status</h3>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Server Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {loading ? 'Updating...' : 'Running'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Data Sync</span>
              <span className="text-sm">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {isMockData ? 'Using Mock Data' : 'Connected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Auto-refresh</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {autoRefresh ? `Active (${refreshInterval}s)` : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
