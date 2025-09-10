import api from './api';

const MAJOR_URL = '/majors';

const MajorService = {
  getAll: async (page = 1, limit = 10, search = '', departmentId = '') => {
    let url = `${MAJOR_URL}?page=${page}&limit=${limit}&search=${search}`;
    if (departmentId) {
      url += `&departmentId=${departmentId}`;
    }
    
    try {
      // Try authenticated endpoint first
      const response = await api.get(url);
      
      // Handle different response formats (Node.js vs FastAPI)
      if (response.data && response.data.data) {
        // Backend returns 'data' property (like Academic Years)
        return {
          rows: response.data.data || [],
          count: response.data.count || 0,
          pagination: response.data.pagination
        };
      } else if (response.data && Array.isArray(response.data.rows)) {
        // Backend returns 'rows' property
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
      console.error('Error fetching majors from authenticated endpoint:', error);
      
      // If authentication fails (401) or other error, try public endpoint as fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication failed, trying public endpoint...');
        try {
          return await MajorService.getAllOpen(page, limit, search);
        } catch (fallbackError) {
          console.error('Public endpoint also failed:', fallbackError);
          return { rows: [], count: 0 };
        }
      }
      
      return { rows: [], count: 0 };
    }
  },

  getById: async (id) => {
    const response = await api.get(`${MAJOR_URL}/${id}`);
    return response.data;
  },

  create: async (majorData) => {
    const response = await api.post(MAJOR_URL, majorData);
    return response.data;
  },

  update: async (id, majorData) => {
    try {
      const response = await api.put(`${MAJOR_URL}/${id}`, majorData);
      return response.data;
    } catch (error) {
      // Handle authentication errors gracefully
      if (error.isAuthError || error.response?.status === 401) {
        console.log('Authentication required for update operation');
        throw new Error('Authentication required. Please log in again.');
      }
      // Handle permission errors
      if (error.isPermissionError || error.response?.status === 403) {
        throw new Error('You do not have permission to update majors.');
      }
      // Re-throw other errors
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${MAJOR_URL}/${id}`);
      return response.data;
    } catch (error) {
      // Handle authentication errors gracefully
      if (error.isAuthError || error.response?.status === 401) {
        console.log('Authentication required for delete operation');
        throw new Error('Authentication required. Please log in again.');
      }
      // Handle permission errors
      if (error.isPermissionError || error.response?.status === 403) {
        throw new Error('You do not have permission to delete majors.');
      }
      // Handle dependency errors (400 status usually means dependencies exist)
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Cannot delete major due to existing dependencies.';
        throw new Error(message);
      }
      // Re-throw other errors
      throw error;
    }
  },

  getByDepartment: async (departmentId) => {
    const response = await api.get(`${MAJOR_URL}/department/${departmentId}`);
    return response.data;
  },

  getAllOpen: async (page = 1, limit = 10, search = '') => {
    let url = `/public/majors?page=${page}&limit=${limit}&search=${search}`;
    try {
      const response = await api.get(url);
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
      console.error('Error fetching majors from open endpoint:', error);
      return { rows: [], count: 0 };
    }
  }
};

export default MajorService;
