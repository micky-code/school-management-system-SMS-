import React, { useState, useEffect, useRef } from 'react';
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

const Dashboard = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const refreshTimerRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsMockData(false); // Always assume real data
      
      const response = await statsService.getAdminDashboardStats();
      console.log('Successfully loaded real-time data from database');
      
      setStats({
        totalStudents: response.totalStudents || 0,
        activeStudents: response.activeStudents || 0,
        totalTeachers: response.totalTeachers || 0,
        totalPrograms: response.totalPrograms || 0,
        recentEnrollments: response.recentEnrollments || 0,
        currentYear: response.currentYear || response.currentAcademicYear || '2024-2025',
        studentsByProgram: response.studentsByProgram || [],
        recentActivity: response.recentActivity || []
      });
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Handle auto-refresh changes
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
        fetchDashboardData();
      }, refreshInterval * 1000);
      
      toast.info(`Auto-refresh enabled. Refreshing every ${refreshInterval} seconds.`);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  const handleRefresh = () => {
    toast.info('Refreshing dashboard data...');
    fetchDashboardData();
  };
  
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
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
            onClick={toggleAutoRefresh}
            className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? `Auto (${refreshInterval}s)` : 'Auto'}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {isMockData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span>Using mock data. Real-time database connection unavailable.</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-4 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-2 rounded"
          >
            Try Again
          </button>
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
                      <span className="font-medium">{activity.name || 'User'}</span>{' '}
                      {activity.action || 'performed an action'}
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
        <div className="p-4 bg-white rounded-lg shadow-sm">
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

        <div className="p-4 bg-white rounded-lg shadow-sm">
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
                Running
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
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
