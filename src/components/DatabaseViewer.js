import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/api';

const DatabaseViewer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await databaseService.getTables();
      if (response.success) {
        setTables(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch tables: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName) => {
    try {
      setLoading(true);
      setError('');
      const response = await databaseService.getTableData(tableName);
      if (response.success) {
        setTableData(response.data);
        setSelectedTable(tableName);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch table data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await databaseService.getStudents();
      if (response.success) {
        setTableData(response.data);
        setSelectedTable('students');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await databaseService.getCourses();
      if (response.success) {
        setTableData(response.data);
        setSelectedTable('courses');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await databaseService.getEnrollments();
      if (response.success) {
        setTableData(response.data);
        setSelectedTable('enrollments');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch enrollments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SMS Database Viewer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with tables */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Database Tables</h2>
            
            {/* Quick action buttons */}
            <div className="mb-4 space-y-2">
              <button
                onClick={fetchStudents}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                disabled={loading}
              >
                View Students
              </button>
              <button
                onClick={fetchCourses}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                disabled={loading}
              >
                View Courses
              </button>
              <button
                onClick={fetchEnrollments}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm"
                disabled={loading}
              >
                View Enrollments
              </button>
            </div>

            {/* All tables list */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">All Tables</h3>
              {loading && tables.length === 0 ? (
                <div className="text-gray-500">Loading tables...</div>
              ) : (
                <ul className="space-y-1">
                  {tables.map((table) => (
                    <li key={table}>
                      <button
                        onClick={() => fetchTableData(table)}
                        className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                          selectedTable === table ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                        }`}
                        disabled={loading}
                      >
                        {table}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {selectedTable ? `Table: ${selectedTable}` : 'Select a table to view data'}
              </h2>
              {tableData.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing {tableData.length} records
                </p>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading data...</div>
                </div>
              ) : tableData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(tableData[0]).map((column) => (
                          <th
                            key={column}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {value !== null ? String(value) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedTable ? (
                <div className="text-center py-12 text-gray-500">
                  No data found in table "{selectedTable}"
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a table from the sidebar to view its data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
