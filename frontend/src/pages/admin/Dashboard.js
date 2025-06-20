import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  UserIcon, 
  BookOpenIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import statsService from '../../services/stats.service';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalPrograms: 0,
    recentEnrollments: 0,
    studentsByProgram: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await statsService.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      icon: <AcademicCapIcon className="h-8 w-8 text-red-500" />,
      link: '/admin/enrollments',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Students by Program',
      count: stats.studentsByProgram.length,
      icon: <BookOpenIcon className="h-8 w-8 text-indigo-500" />,
      link: '/admin/programs',
      bgColor: 'bg-indigo-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg font-medium text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {currentYear && (
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <span className="text-blue-800 font-medium">
              Current Academic Year: {currentYear.name}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.bgColor} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
                <p className="text-3xl font-bold mt-2">{card.count}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/students/new"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center space-x-3"
            >
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <span className="font-medium">Add Student</span>
            </Link>
            <Link
              to="/admin/teachers/new"
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex items-center space-x-3"
            >
              <UserIcon className="h-6 w-6 text-green-500" />
              <span className="font-medium">Add Teacher</span>
            </Link>
            <Link
              to="/admin/subjects/new"
              className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg flex items-center space-x-3"
            >
              <BookOpenIcon className="h-6 w-6 text-indigo-500" />
              <span className="font-medium">Add Subject</span>
            </Link>
            <Link
              to="/admin/majors/new"
              className="bg-red-50 hover:bg-red-100 p-4 rounded-lg flex items-center space-x-3"
            >
              <AcademicCapIcon className="h-6 w-6 text-red-500" />
              <span className="font-medium">Add Major</span>
            </Link>
          </div>
        </div>

        {/* Students by Program */}
        {stats.studentsByProgram && stats.studentsByProgram.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Program</h3>
            <div className="space-y-3">
              {stats.studentsByProgram.map((program, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{program.program_name}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {program.student_count} students
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">System Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Last Update</span>
              <span className="font-medium">June 15, 2025</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Server Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
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
