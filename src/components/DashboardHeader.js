import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Real-time notifications removed

/**
 * Dashboard header component with user info and real-time notifications
 */
const DashboardHeader = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Real-time notifications removed */}
        
        {/* User profile dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
            </div>
          </div>
        </div>
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
