import ApiAdapter from './api-adapter';
import axios from 'axios';

// Keep the original api import for backward compatibility during transition
import api from './api';

// Direct API URL for fallback
const DIRECT_API_URL = 'http://localhost:5000/api';
const STUDENT_URL = '/students';

const StudentService = {
  getAll: async (page = 1, limit = 10, search = '', program_id = '', batch_id = '') => {
    try {
      // Check for token before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return {
          success: false,
          count: 0,
          totalPages: 1,
          currentPage: page,
          data: [],
          error: 'Authentication required. Please log in.',
          isAuthError: true
        };
      }

      // Use ApiAdapter for better compatibility with both backends
      const params = { page, limit, search };
      if (program_id) params.program_id = program_id;
      if (batch_id) params.batch_id = batch_id;
      
      console.log('Fetching students with ApiAdapter...');
      const result = await ApiAdapter.students.getAll(page, limit, search);
      console.log('ApiAdapter student result:', result);
      return result;
    } catch (error) {
      console.error('Error in StudentService.getAll with ApiAdapter:', error);
      
      // Try direct axios fallback
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        if (!token) {
          return {
            success: false,
            count: 0,
            totalPages: 1,
            currentPage: page,
            data: [],
            error: 'Authentication required. Please log in.',
            isAuthError: true
          };
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(program_id && { program_id }),
          ...(batch_id && { batch_id })
        });
        
        console.log(`Making direct API call to ${DIRECT_API_URL}${STUDENT_URL}?${params}`);
        const response = await axios.get(`${DIRECT_API_URL}${STUDENT_URL}?${params}`, { headers });
        console.log('Direct API student response:', response.data);
        
        // Handle different response formats
        if (response.data && response.data.data) {
          // FastAPI format with data property
          return {
            success: true,
            count: response.data.total || 0,
            totalPages: Math.ceil((response.data.total || 0) / limit),
            currentPage: page,
            data: response.data.data || []
          };
        } else if (response.data && Array.isArray(response.data.rows)) {
          // Node.js format with rows property
          return {
            success: true,
            count: response.data.count || 0,
            totalPages: Math.ceil((response.data.count || 0) / limit),
            currentPage: page,
            data: response.data.rows || []
          };
        } else if (Array.isArray(response.data)) {
          // Simple array format
          return {
            success: true,
            count: response.data.length,
            totalPages: Math.ceil(response.data.length / limit),
            currentPage: page,
            data: response.data
          };
        }
        
        // Default structure if response format is unknown
        return {
          success: true,
          count: 0,
          totalPages: 1,
          currentPage: page,
          data: []
        };
      } catch (fallbackError) {
        console.error('Error in direct API fallback for students:', fallbackError);
        
        // Handle 401 unauthorized errors specifically
        if (fallbackError.response && fallbackError.response.status === 401) {
          return {
            success: false,
            count: 0,
            totalPages: 1,
            currentPage: page,
            data: [],
            error: 'Your session has expired. Please log in again.',
            isAuthError: true
          };
        }
        
        // Return a default structure to prevent UI crashes
        return {
          success: false,
          count: 0,
          totalPages: 1,
          currentPage: page,
          data: [],
          error: fallbackError.message || 'Failed to fetch students'
        };
      }
    }
  },

  getById: async (id) => {
    try {
      console.log('Fetching student by ID with ApiAdapter...');
      const result = await ApiAdapter.students.getById(id);
      console.log('ApiAdapter student by ID result:', result);
      return result;
    } catch (error) {
      console.error('Error in StudentService.getById with ApiAdapter:', error);
      
      // Try direct axios fallback
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log(`Making direct API call to ${DIRECT_API_URL}${STUDENT_URL}/${id}`);
        const response = await axios.get(`${DIRECT_API_URL}${STUDENT_URL}/${id}`, { headers });
        console.log('Direct API student by ID response:', response.data);
        
        return response.data;
      } catch (fallbackError) {
        console.error('Error in direct API fallback for student by ID:', fallbackError);
        throw fallbackError;
      }
    }
  },

  create: async (studentData) => {
    try {
      console.log('Creating student with ApiAdapter...');
      const result = await ApiAdapter.students.create(studentData);
      console.log('ApiAdapter create student result:', result);
      return result;
    } catch (error) {
      console.error('Error in StudentService.create with ApiAdapter:', error);
      
      // Try direct axios fallback
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Handle file uploads if present
        let data = studentData;
        let config = { headers };
        
        if (studentData.profile_picture instanceof File) {
          const formData = new FormData();
          Object.keys(studentData).forEach(key => {
            if (key === 'profile_picture') {
              formData.append(key, studentData[key]);
            } else {
              formData.append(key, studentData[key] === null ? '' : studentData[key]);
            }
          });
          data = formData;
          config.headers['Content-Type'] = 'multipart/form-data';
        }
        
        console.log(`Making direct API call to ${DIRECT_API_URL}${STUDENT_URL}`);
        const response = await axios.post(`${DIRECT_API_URL}${STUDENT_URL}`, data, config);
        console.log('Direct API create student response:', response.data);
        
        return response.data;
      } catch (fallbackError) {
        console.error('Error in direct API fallback for creating student:', fallbackError);
        throw fallbackError;
      }
    }
  },

  update: async (id, studentData) => {
    try {
      console.log('Updating student with ApiAdapter...');
      const result = await ApiAdapter.students.update(id, studentData);
      console.log('ApiAdapter update student result:', result);
      return result;
    } catch (error) {
      console.error('Error in StudentService.update with ApiAdapter:', error);
      
      // Try direct axios fallback
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Handle file uploads if present
        let data = studentData;
        let config = { headers };
        
        if (studentData.profile_picture instanceof File) {
          const formData = new FormData();
          Object.keys(studentData).forEach(key => {
            if (key === 'profile_picture') {
              formData.append(key, studentData[key]);
            } else {
              formData.append(key, studentData[key] === null ? '' : studentData[key]);
            }
          });
          data = formData;
          config.headers['Content-Type'] = 'multipart/form-data';
        }
        
        console.log(`Making direct API call to ${DIRECT_API_URL}${STUDENT_URL}/${id}`);
        const response = await axios.put(`${DIRECT_API_URL}${STUDENT_URL}/${id}`, data, config);
        console.log('Direct API update student response:', response.data);
        
        return response.data;
      } catch (fallbackError) {
        console.error('Error in direct API fallback for updating student:', fallbackError);
        throw fallbackError;
      }
    }
  },

  delete: async (id) => {
    try {
      console.log('Deleting student with ApiAdapter...');
      const result = await ApiAdapter.students.delete(id);
      console.log('ApiAdapter delete student result:', result);
      return result;
    } catch (error) {
      console.error('Error in StudentService.delete with ApiAdapter:', error);
      
      // Try direct axios fallback
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log(`Making direct API call to ${DIRECT_API_URL}${STUDENT_URL}/${id}`);
        const response = await axios.delete(`${DIRECT_API_URL}${STUDENT_URL}/${id}`, { headers });
        console.log('Direct API delete student response:', response.data);
        
        return response.data;
      } catch (fallbackError) {
        console.error('Error in direct API fallback for deleting student:', fallbackError);
        throw fallbackError;
      }
    }
  },

  getByProgram: async (programId, page = 1, limit = 20) => {
    try {
      return await ApiAdapter.students.getByProgram(programId, page, limit);
    } catch (error) {
      console.error('Error in StudentService.getByProgram:', error);
      // Return a default structure to prevent UI crashes
      return {
        success: false,
        count: 0,
        totalPages: 1,
        currentPage: page,
        data: [],
        error: error.message || 'Failed to fetch students by program'
      };
    }
  },

  getByParent: async (parentId, page = 1, limit = 20) => {
    try {
      return await ApiAdapter.students.getByParent(parentId, page, limit);
    } catch (error) {
      console.error('Error in StudentService.getByParent:', error);
      // Return a default structure to prevent UI crashes
      return {
        success: false,
        count: 0,
        totalPages: 1,
        currentPage: page,
        data: [],
        error: error.message || 'Failed to fetch students by parent'
      };
    }
  }
};

export default StudentService;
