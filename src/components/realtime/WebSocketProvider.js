/**
 * WebSocket Context Provider for global real-time communication
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionStats, setConnectionStats] = useState(null);

  // API base URL for real-time server
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5002';
  const WS_BASE = API_BASE.replace('http', 'ws');

  // Get auth token for WebSocket authentication
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // WebSocket connection with authentication
  const {
    lastMessage,
    connectionStatus,
    sendJsonMessage,
    readyState
  } = useWebSocket(`${WS_BASE}/ws`, {
    onMessage: (message) => {
      handleGlobalMessage(message);
    },
    onOpen: () => {
      setIsConnected(true);
      console.log('Global WebSocket connected');
      
      // Send initial subscription
      sendJsonMessage({
        type: 'subscribe',
        data_types: ['students', 'attendance', 'grades', 'system_notifications']
      });
      
      // Get connection stats
      sendJsonMessage({
        type: 'get_stats'
      });
    },
    onClose: () => {
      setIsConnected(false);
      console.log('Global WebSocket disconnected');
    },
    onError: (error) => {
      console.error('Global WebSocket error:', error);
      setIsConnected(false);
    }
  });

  // Handle global WebSocket messages
  const handleGlobalMessage = (message) => {
    const { event_type, data, type } = message;

    // Handle connection stats
    if (type === 'stats') {
      setConnectionStats(data);
      return;
    }

    // Handle system notifications
    if (event_type === 'system_notification') {
      const notification = {
        id: Date.now(),
        message: data.message,
        level: data.level || 'info',
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      
      // Show toast notification
      switch (data.level) {
        case 'success':
          toast.success(data.message);
          break;
        case 'warning':
          toast.warning(data.message);
          break;
        case 'error':
          toast.error(data.message);
          break;
        default:
          toast.info(data.message);
      }
    }

    // Handle data refresh events
    if (event_type === 'data_refresh') {
      console.log(`Data refresh event: ${data.entity_type}`);
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('dataRefresh', {
        detail: { entityType: data.entity_type, action: data.action }
      }));
    }

    // Handle specific entity events
    if (event_type?.startsWith('student_')) {
      window.dispatchEvent(new CustomEvent('studentUpdate', {
        detail: { eventType: event_type, data }
      }));
    }

    if (event_type?.startsWith('attendance_')) {
      window.dispatchEvent(new CustomEvent('attendanceUpdate', {
        detail: { eventType: event_type, data }
      }));
    }

    if (event_type?.startsWith('grade_')) {
      window.dispatchEvent(new CustomEvent('gradeUpdate', {
        detail: { eventType: event_type, data }
      }));
    }
  };

  // Send message through WebSocket
  const sendMessage = (message) => {
    if (isConnected) {
      sendJsonMessage(message);
      return true;
    }
    return false;
  };

  // Broadcast notification to all users
  const broadcastNotification = async (message, level = 'info') => {
    try {
      const response = await fetch(`${API_BASE}/ws/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          event_type: 'system_notification',
          data: { message, level },
          connection_type: 'all'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to broadcast notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return { status: 'error', message: error.message };
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Ping server to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendJsonMessage({
          type: 'ping',
          timestamp: Date.now()
        });
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, sendJsonMessage]);

  const contextValue = {
    // Connection state
    isConnected,
    connectionStatus,
    connectionStats,
    
    // Messaging
    sendMessage,
    broadcastNotification,
    
    // Notifications
    notifications,
    clearNotifications,
    getUnreadCount,
    markAsRead,
    
    // WebSocket instance
    lastMessage,
    readyState
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
