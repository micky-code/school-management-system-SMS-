import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
      { name: 'Academic Years', path: '/admin/academic-years', icon: <CalendarIcon className="w-6 h-6" /> },
      { name: 'Programs', path: '/admin/programs', icon: <AcademicCapIcon className="w-6 h-6" /> },
      { name: 'Departments', path: '/admin/departments', icon: <BuildingOfficeIcon className="w-6 h-6" /> },
      { name: 'Majors', path: '/admin/majors', icon: <BookOpenIcon className="w-6 h-6" /> },
      { name: 'Subjects', path: '/admin/subjects', icon: <DocumentTextIcon className="w-6 h-6" /> },
      { name: 'Subject Assignment', path: '/admin/subject-assignment', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
      { name: 'Teachers', path: '/admin/teachers', icon: <UserIcon className="w-6 h-6" /> },
      { name: 'Students', path: '/admin/students', icon: <UserGroupIcon className="w-6 h-6" /> },
      { name: 'Enrollments', path: '/admin/enrollments', icon: <AcademicCapIcon className="w-6 h-6" /> },
      { name: 'Parents', path: '/admin/parents', icon: <UserIcon className="w-6 h-6" /> },
      // { name: 'Schedule', path: '/admin/schedule', icon: <CalendarIcon className="w-6 h-6" /> },
      { name: 'Attendance', path: '/admin/attendance', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
      { name: 'Exams', path: '/admin/exams', icon: <DocumentTextIcon className="w-6 h-6" /> },
      { name: 'Marks', path: '/admin/marks', icon: <ChartBarIcon className="w-6 h-6" /> },
      { name: 'Promotions', path: '/admin/promotions', icon: <CheckBadgeIcon className="w-6 h-6" /> },
      { name: 'Scholarships', path: '/admin/scholarships', icon: <AcademicCapIcon className="w-6 h-6" /> },
      { name: 'Payments', path: '/admin/payments', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
      { name: 'Roles', path: '/admin/roles', icon: <UserIcon className="w-6 h-6" /> },
      { name: 'Settings', path: '/admin/settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
      { name: 'Real-time Demo', path: '/admin/realtime-demo', icon: <BoltIcon className="w-6 h-6" /> },
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
      { name: 'My Subjects', path: '/teacher/subjects', icon: <DocumentTextIcon className="w-6 h-6" /> },
      // { name: 'Schedule', path: '/teacher/schedule', icon: <CalendarIcon className="w-6 h-6" /> },
      { name: 'Attendance', path: '/teacher/attendance', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
      { name: 'Exams', path: '/teacher/exams', icon: <DocumentTextIcon className="w-6 h-6" /> },
      { name: 'Marks', path: '/teacher/marks', icon: <ChartBarIcon className="w-6 h-6" /> },
      { name: 'Profile', path: '/teacher/profile', icon: <UserIcon className="w-6 h-6" /> },
    ],
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
      { name: 'My Subjects', path: '/student/subjects', icon: <DocumentTextIcon className="w-6 h-6" /> },
      { name: 'Schedule', path: '/student/schedule', icon: <CalendarIcon className="w-6 h-6" /> },
      { name: 'Attendance', path: '/student/attendance', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
      { name: 'Exams', path: '/student/exams', icon: <DocumentTextIcon className="w-6 h-6" /> },
      { name: 'Marks', path: '/student/marks', icon: <ChartBarIcon className="w-6 h-6" /> },
      { name: 'Payments', path: '/student/payments', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
      { name: 'Profile', path: '/student/profile', icon: <UserIcon className="w-6 h-6" /> },
    ],
    parent: [
      { name: 'Dashboard', path: '/parent/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
      { name: 'My Children', path: '/parent/children', icon: <UserGroupIcon className="w-6 h-6" /> },
      { name: 'Attendance', path: '/parent/attendance', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
      { name: 'Marks', path: '/parent/marks', icon: <ChartBarIcon className="w-6 h-6" /> },
      { name: 'Payments', path: '/parent/payments', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
      { name: 'Profile', path: '/parent/profile', icon: <UserIcon className="w-6 h-6" /> },
    ]
  };

  const currentMenuItems = menuItems[role] || menuItems.admin;

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <span className="sr-only">Open main menu</span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-90">
          <div className="pt-16 pb-3 px-2 space-y-1 sm:px-3">
            {currentMenuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium flex items-center`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  sessionStorage.setItem('feature_click', 'true');
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-800">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <img src="/SPI.jpg" alt="logo" style={{ width: '50px', height: '50px', borderRadius: '10%', objectFit: 'cover',marginRight: '10px' }} />
            <h1 className="text-white text-xl font-bold">SPI-SMS</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {currentMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  onClick={() => sessionStorage.setItem('feature_click', 'true')}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
