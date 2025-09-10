import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import statsService from '../../services/stats.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthErrorMessage from '../../components/AuthErrorMessage';
import { 
  UserCircleIcon,
  BellAlertIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = ({ authError }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    children: [],
    notifications: [],
    upcomingEvents: [],
    paymentHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get parent ID from current user or use default
      const parentId = currentUser?.id || 1;
      console.log('Fetching parent dashboard data for ID:', parentId);
      
      const response = await statsService.getParentStats(parentId);
      
      console.log('Parent dashboard data received:', response);
      
      if (response) {
        setStats(response.data || {});
        setIsMockData(response._isMockData || false);
        
        if (response._isMockData) {
          console.warn('Using mock data for parent dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
      
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

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'academic':
        return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'attendance':
        return <CheckBadgeIcon className="h-5 w-5 text-green-500" />;
      case 'payment':
        return <BanknotesIcon className="h-5 w-5 text-yellow-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'grade':
        return <AcademicCapIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellAlertIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="h-4 w-4 mr-1" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">Parent Dashboard</h1>
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
            <h1 className="text-2xl font-semibold text-gray-900">Parent Dashboard</h1>
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
  
  // End of helper functions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold text-gray-900">Parent Dashboard</h1>
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

      {/* Children Summary Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Your Children</h2>
            </div>
            <p className="mt-2 opacity-90">
              You have {stats.children?.length || 0} {stats.children?.length === 1 ? 'child' : 'children'} enrolled
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link to="/parent/children" className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-150 rounded px-4 py-2 text-white font-medium">
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Children Cards */}
      {stats.children && stats.children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.children.map((child, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
                    {child?.name ? child.name.charAt(0) : ''}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{child?.name || 'Child'}</h3>
                    <p className="text-sm text-gray-600">{child?.program || 'Program'} • {child?.grade || ''}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">GPA</p>
                  <p className="text-lg font-semibold">{child.gpa?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="text-lg font-semibold text-gray-900">{child?.attendance ?? 'N/A'}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-900 mb-2">Recent Grades</p>
                  {child.recentGrades && child.recentGrades.length > 0 ? (
                    <div className="space-y-2">
                      {child.recentGrades.map((grade, gradeIndex) => (
                        <div key={gradeIndex} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm text-gray-800">{grade.course}</span>
                          <span className="text-sm font-medium">{grade.grade}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent grades</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <UserCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">No children information available</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BellAlertIcon className="h-5 w-5 mr-2 text-orange-500" />
            Important Notifications
          </h3>
          
          {stats.notifications && stats.notifications.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BellAlertIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No notifications</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming School Events
          </h3>
          
          {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BanknotesIcon className="h-5 w-5 mr-2 text-green-500" />
            Payment History
          </h3>
          
          {stats.paymentHistory && stats.paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.paymentHistory.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold">${payment.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPaymentStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BanknotesIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No payment history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
