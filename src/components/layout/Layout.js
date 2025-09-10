import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { NotificationCenter } from '../realtime';
import { getUserData } from '../../utils/authUtils';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data only once on component mount
    // ProtectedRoute already handles authentication
    const userData = getUserData();
    
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // We don't need to check authentication here since ProtectedRoute handles it
  // Just ensure we have user data for the layout components
  if (!user) {
    // Instead of redirecting, just use default values
    // This prevents redirect loops
    console.log('No user data in Layout, using default');
    setUser({
      name: 'Guest User',
      role: 'guest'
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar role={user.role} />
      <div className="md:pl-64">
        <div className="relative">
          <Header user={user} />
          <div className="absolute top-4 right-4 z-50">
            <NotificationCenter />
          </div>
        </div>
        <main className="py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
