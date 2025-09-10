import ApiAdapter from './api-adapter';
import SMSDBDataFetcher from './smsdb-data-fetcher';
import axios from 'axios';

const DEPARTMENT_URL = '/departments';
const PUBLIC_DEPARTMENT_URL = '/public/departments';
const DIRECT_API_URL = 'http://localhost:5000/api';

const DepartmentService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      // Use new unified data fetcher for smsdb
      console.log('Fetching departments from smsdb...');
      const result = await SMSDBDataFetcher.getDepartments(page, limit, search);
      
      if (result.success) {
        return result;
      }
      
      // Fallback to original method
      console.log('Falling back to original department fetching...');
      // First try with the public endpoint
      try {
        console.log('Trying public departments endpoint');
        const publicResponse = await axios.get(`${DIRECT_API_URL}${PUBLIC_DEPARTMENT_URL}?page=${page}&limit=${limit}&search=${search}`);
        
        if (publicResponse.data && publicResponse.data.data) {
          console.log('Public departments endpoint succeeded');
          return {
            rows: publicResponse.data.data || [],
            count: publicResponse.data.total || 0
          };
        }
      } catch (publicError) {
        console.log('Public departments endpoint failed, trying authenticated endpoint');
      }
      
      // Then try with the api instance (authenticated)
      const response = await api.get(`${DEPARTMENT_URL}?page=${page}&limit=${limit}&search=${search}`);
      // Handle different response formats (Node.js vs FastAPI)
      if (response.data && response.data.data) {
        // FastAPI format with data property
        return {
          rows: response.data.data || [],
          count: response.data.total || 0
        };
      } else if (response.data && Array.isArray(response.data.rows)) {
        // Node.js format with rows property
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Simple array format
        return {
          rows: response.data,
          count: response.data.length
        };
      }
      // Default empty response
      return { rows: [], count: 0 };
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      // Fallback to direct call with correct port
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      try {
        const response = await axios.get(`${DIRECT_API_URL}${DEPARTMENT_URL}?page=${page}&limit=${limit}&search=${search}`, {
          headers
        });
        
        // Process the response the same way
        if (response.data && response.data.data) {
          return {
            rows: response.data.data || [],
            count: response.data.total || 0
          };
        } else if (response.data && Array.isArray(response.data.rows)) {
          return response.data;
        } else if (Array.isArray(response.data)) {
          return {
            rows: response.data,
            count: response.data.length
          };
        }
        return { rows: [], count: 0 };
      } catch (fallbackError) {
        console.error('All API calls failed:', fallbackError);
        return { rows: [], count: 0 };
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${DEPARTMENT_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${DIRECT_API_URL}${DEPARTMENT_URL}/${id}`, { headers });
      return response.data;
    }
  },

  create: async (departmentData) => {
    try {
      const response = await api.post(DEPARTMENT_URL, departmentData);
      return response.data;
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${DIRECT_API_URL}${DEPARTMENT_URL}`, departmentData, { headers });
      return response.data;
    }
  },

  update: async (id, departmentData) => {
    try {
      const response = await api.put(`${DEPARTMENT_URL}/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${DIRECT_API_URL}${DEPARTMENT_URL}/${id}`, departmentData, { headers });
      return response.data;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${DEPARTMENT_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.delete(`${DIRECT_API_URL}${DEPARTMENT_URL}/${id}`, { headers });
      return response.data;
    }
  }
};

export default DepartmentService;
