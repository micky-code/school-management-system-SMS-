import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Dashboard Connection Status Component
 * Displays API connection status (real-time features removed)
 */
const DashboardConnectionStatus = ({ onConnectionChange, autoRefreshInterval = 30 }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    apiConnected: false,
    directDbConnected: false
  });

  // Function to check direct database connection via API health endpoint
  const checkDirectDbConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health/database', {
        timeout: 5000 // 5 second timeout
      });
      
      const isConnected = response.data && response.data.success;
      
      setConnectionStatus(prev => ({
        ...prev,
        directDbConnected: isConnected
      }));
      
      return isConnected;
    } catch (error) {
      console.error('Direct DB connection check failed:', error);
      setConnectionStatus(prev => ({
        ...prev,
        directDbConnected: false
      }));
      return false;
    }
  };
  
  // Function to check Node.js API connection
  const checkApiConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 5000 // 5 second timeout
      });
      
      const isConnected = response.status === 200;
      
      setConnectionStatus(prev => ({
        ...prev,
        apiConnected: isConnected
      }));
      
      return isConnected;
    } catch (error) {
      console.error('API connection check failed:', error);
      setConnectionStatus(prev => ({
        ...prev,
        apiConnected: false
      }));
      return false;
    }
  };

  useEffect(() => {
    // Check direct database and API connections immediately
    checkDirectDbConnection();
    checkApiConnection();
    
    // Set up interval to check connections periodically
    const connectionCheckInterval = setInterval(() => {
      checkDirectDbConnection();
      checkApiConnection();
    }, 30000); // Check every 30 seconds
    
    // Notify parent component of initial connection status
    if (onConnectionChange) {
      onConnectionChange({ connected: false, polling: true });
    }

    return () => {
      // Clean up on component unmount
      clearInterval(connectionCheckInterval);
    };
  }, [onConnectionChange]);


  // Handle refresh button click
  const handleRefresh = () => {
    checkDirectDbConnection();
    checkApiConnection();
    
    toast.info('Checking API connections...', {
      autoClose: 3000,
      position: 'bottom-right'
    });
  };

  return (
    <div className="flex flex-col space-y-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="status-container grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Direct DB Connection Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus.directDbConnected 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            Direct DB: {connectionStatus.directDbConnected ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {/* API Connection Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus.apiConnected 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            API: {connectionStatus.apiConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      <div className="actions-container">
        <button
          onClick={handleRefresh}
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default DashboardConnectionStatus;
