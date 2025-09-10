import axios from 'axios';
import { clearAuthData } from '../utils/authUtils';

const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track failed auth requests to prevent multiple redirects
let authFailCount = 0;
let redirectInProgress = false;

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Reset auth fail counter on successful requests
    authFailCount = 0;
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected:', error.config?.url);
      
      // Check if we're already on the login page to prevent redirect loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        // Clear auth data but don't redirect immediately for CRUD operations
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem('auth_failed', 'true');
        
        // Add custom property to help frontend handle auth errors gracefully
        error.isAuthError = true;
        error.needsReauth = true;
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      console.log('Permission denied for:', error.config?.url);
      error.isPermissionError = true;
    }
    
    return Promise.reject(error);
  }
);

// Make axios instance available globally for auth utilities
window.axios = api;

// Database API functions for smsspi_db
const DB_API_URL = 'http://localhost/sms-frontend-clone/backend/api';

// Create a separate axios instance for database operations
const dbApi = axios.create({
  baseURL: DB_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Database service functions
export const databaseService = {
  // Get all tables in the database
  getTables: async () => {
    try {
      const response = await dbApi.get('/tables');
      return response.data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  // Get data from a specific table
  getTableData: async (tableName, limit = 100) => {
    try {
      const response = await dbApi.get(`/data?table=${tableName}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      throw error;
    }
  },

  // Get students data
  getStudents: async () => {
    try {
      const response = await dbApi.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Get courses data
  getCourses: async () => {
    try {
      const response = await dbApi.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get enrollments data
  getEnrollments: async () => {
    try {
      const response = await dbApi.get('/enrollments');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  }
};

export default api;
