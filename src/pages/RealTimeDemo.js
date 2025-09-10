/**
 * Real-time Demo Page showcasing WebSocket functionality
 */
import React, { useState } from 'react';
import { RealTimeStudentList, useWebSocketContext } from '../components/realtime';
import { toast } from 'react-toastify';

const RealTimeDemo = () => {
  const [testMessage, setTestMessage] = useState('');
  const [broadcastLevel, setBroadcastLevel] = useState('info');
  
  const {
    isConnected,
    connectionStatus,
    connectionStats,
    sendMessage,
    broadcastNotification,
    notifications
  } = useWebSocketContext();

  // Send test message
  const handleSendTestMessage = () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const success = sendMessage({
      type: 'test_message',
      data: {
        message: testMessage,
        timestamp: new Date().toISOString()
      }
    });

    if (success) {
      toast.success('Test message sent!');
      setTestMessage('');
    } else {
      toast.error('WebSocket not connected');
    }
  };

  // Broadcast notification to all users
  const handleBroadcastNotification = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const result = await broadcastNotification(testMessage, broadcastLevel);
    
    if (result.status === 'success') {
      toast.success('Notification broadcasted!');
      setTestMessage('');
    } else {
      toast.error('Failed to broadcast notification');
    }
  };

  // Simulate student operations
  const simulateStudentOperations = async () => {
    const operations = [
      {
        action: 'create',
        data: {
          name: `Demo Student ${Date.now()}`,
          email: `demo${Date.now()}@example.com`,
          program: 'Computer Science',
          status: 'active'
        }
      }
    ];

    for (const op of operations) {
      try {
        const response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(op.data)
        });

        if (response.ok) {
          toast.success(`Student ${op.action} operation completed`);
        }
      } catch (error) {
        console.error('Error in student operation:', error);
        toast.error(`Failed to ${op.action} student`);
      }

      // Wait between operations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-time Demo</h1>
          <p className="mt-2 text-gray-600">
            Demonstration of WebSocket real-time updates and notifications
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status: </span>
              <span className="font-medium">{connectionStatus}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Notifications: </span>
              <span className="font-medium">{notifications.length}</span>
            </div>
          </div>

          {connectionStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Connection Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Connections</div>
                  <div className="font-medium">{connectionStats.total_connections}</div>
                </div>
                <div>
                  <div className="text-gray-500">Active Users</div>
                  <div className="font-medium">{connectionStats.active_users}</div>
                </div>
                <div>
                  <div className="text-gray-500">Messages Sent</div>
                  <div className="font-medium">{connectionStats.messages_sent}</div>
                </div>
                <div>
                  <div className="text-gray-500">Uptime</div>
                  <div className="font-medium">{connectionStats.uptime}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
                />
                <button
                  onClick={handleSendTestMessage}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Test
                </button>
              </div>
            </div>

            {/* Broadcast Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broadcast Notification
              </label>
              <div className="flex space-x-2">
                <select
                  value={broadcastLevel}
                  onChange={(e) => setBroadcastLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <button
                  onClick={handleBroadcastNotification}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Broadcast
                </button>
              </div>
            </div>

            {/* Simulate Operations */}
            <div>
              <button
                onClick={simulateStudentOperations}
                disabled={!isConnected}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🎭 Simulate Student Operations
              </button>
              <p className="text-sm text-gray-500 mt-1">
                Creates demo students to test real-time updates
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Student List */}
        <RealTimeStudentList />

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🚀 How to Test Real-time Features
          </h3>
          <ul className="text-blue-700 space-y-2">
            <li>• <strong>WebSocket Connection:</strong> Check the connection status above</li>
            <li>• <strong>Real-time Updates:</strong> Click "Add Student" to see instant updates</li>
            <li>• <strong>Notifications:</strong> Use the notification bell in the top-right corner</li>
            <li>• <strong>Broadcast Messages:</strong> Send messages to all connected users</li>
            <li>• <strong>Fallback Mode:</strong> If WebSocket fails, polling will automatically activate</li>
            <li>• <strong>Multiple Tabs:</strong> Open multiple browser tabs to see real-time sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDemo;
