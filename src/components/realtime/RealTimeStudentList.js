/**
 * Real-time Student List Component with WebSocket and Polling fallback
 */
import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import usePolling from '../../hooks/usePolling';
import { toast } from 'react-toastify';

const RealTimeStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionMethod, setConnectionMethod] = useState('websocket');
  const [stats, setStats] = useState(null);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const WS_BASE = API_BASE.replace('http', 'ws');

  // Fetch students function for polling fallback
  const fetchStudents = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/students`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }, [API_BASE]);

  // Fetch student stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/students/stats/summary`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE]);

  // WebSocket connection
  const {
    lastMessage,
    connectionStatus,
    sendJsonMessage,
    readyState
  } = useWebSocket(`${WS_BASE}/ws/ws/students`, {
    onMessage: (message) => {
      console.log('WebSocket message received:', message);
      handleWebSocketMessage(message);
    },
    onOpen: () => {
      console.log('WebSocket connected successfully');
      setConnectionMethod('websocket');
      setError(null);
      // Subscribe to student updates
      sendJsonMessage({
        type: 'subscribe',
        data_types: ['students', 'student_stats']
      });
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setConnectionMethod('polling');
    },
    onClose: () => {
      console.log('WebSocket disconnected, falling back to polling');
      setConnectionMethod('polling');
    }
  });

  // Polling fallback
  const {
    data: pollingData,
    loading: pollingLoading,
    error: pollingError,
    lastUpdated
  } = usePolling(fetchStudents, {
    interval: 5000,
    enabled: connectionMethod === 'polling',
    onSuccess: (data) => {
      setStudents(data.students || []);
      setLoading(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    }
  });

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    const { event_type, data } = message;

    switch (event_type) {
      case 'student_created':
        setStudents(prev => [...prev, data.student]);
        toast.success(data.message || 'New student added');
        fetchStats(); // Refresh stats
        break;

      case 'student_updated':
        setStudents(prev => 
          prev.map(student => 
            student.id === data.student.id ? data.student : student
          )
        );
        toast.info(data.message || 'Student updated');
        fetchStats(); // Refresh stats
        break;

      case 'student_deleted':
        setStudents(prev => 
          prev.filter(student => student.id !== data.student_id)
        );
        toast.warning(data.message || 'Student removed');
        fetchStats(); // Refresh stats
        break;

      case 'data_refresh':
        if (data.entity_type === 'students') {
          // Refresh student list
          fetchStudents().then(result => {
            setStudents(result.students || []);
          }).catch(console.error);
        }
        break;

      case 'system_notification':
        const level = data.level || 'info';
        if (level === 'success') toast.success(data.message);
        else if (level === 'warning') toast.warning(data.message);
        else if (level === 'error') toast.error(data.message);
        else toast.info(data.message);
        break;

      default:
        console.log('Unhandled WebSocket message:', message);
    }
  }, [fetchStudents, fetchStats]);

  // Initial data load for WebSocket mode
  useEffect(() => {
    if (connectionMethod === 'websocket' && readyState === WebSocket.OPEN) {
      fetchStudents().then(result => {
        setStudents(result.students || []);
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching initial data:', error);
        setError(error.message);
        setLoading(false);
      });
      
      fetchStats();
    }
  }, [connectionMethod, readyState, fetchStudents, fetchStats]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    if (connectionMethod === 'websocket') {
      fetchStudents().then(result => {
        setStudents(result.students || []);
      }).catch(console.error);
    }
    fetchStats();
  }, [connectionMethod, fetchStudents, fetchStats]);

  // Add new student (demo function)
  const handleAddStudent = useCallback(async () => {
    try {
      const newStudent = {
        name: `Test Student ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        program: 'Computer Science',
        status: 'active'
      };

      const response = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
        },
        body: JSON.stringify(newStudent)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Student added:', result);
      
      // If not using WebSocket, manually update the list
      if (connectionMethod === 'polling') {
        setStudents(prev => [...prev, result.student]);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  }, [API_BASE, connectionMethod]);

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Real-time Student List</h2>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              connectionMethod === 'websocket' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionMethod === 'websocket' ? '🔌 WebSocket' : '🔄 Polling'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'Connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleAddStudent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_students}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active_students}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive_students}</div>
            <div className="text-sm text-gray-600">Inactive Students</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.program_distribution || {}).length}
            </div>
            <div className="text-sm text-gray-600">Programs</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Student List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {students.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No students found
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeStudentList;
