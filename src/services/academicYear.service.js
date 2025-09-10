import api from './api';
import axios from 'axios';
import SMSDBDataFetcher from './smsdb-data-fetcher';

const ACADEMIC_YEAR_URL = '/academic-years';
const PUBLIC_ACADEMIC_YEAR_URL = '/public/academic-years';
const DIRECT_API_URL = 'http://localhost:5000/api';

const AcademicYearService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    try {
      // Try direct public endpoint first
      console.log('Trying public academic years endpoint');
      const publicResponse = await axios.get(`${DIRECT_API_URL}${PUBLIC_ACADEMIC_YEAR_URL}?page=${page}&limit=${limit}&search=${search}`);
      
      if (publicResponse.data && publicResponse.data.success && publicResponse.data.rows) {
        console.log('Public academic years endpoint succeeded');
        return {
          success: true,
          rows: publicResponse.data.rows || [],
          count: publicResponse.data.count || 0,
          data: publicResponse.data.rows || [],
          pagination: publicResponse.data.pagination
        };
      }
    } catch (error) {
      console.log('Public endpoint failed, trying authenticated endpoint');
      // Fallback to authenticated endpoint
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}?page=${page}&limit=${limit}&search=${search}`, {
          headers
        });
        
        // Ensure consistent response format
        return {
          success: response.data.success || true,
          rows: response.data.rows || response.data.data || [],
          count: response.data.count || 0,
          data: response.data.rows || response.data.data || [],
          pagination: response.data.pagination
        };
      } catch (authError) {
        console.error('All endpoints failed:', authError.message);
        return { 
          success: false, 
          error: authError.message, 
          data: [], 
          rows: [], 
          count: 0 
        };
      }
    }
  },

  getAllOpen: async (page = 1, limit = 10, search = '') => {
    try {
      // First try with the api instance
      const response = await api.get(`${OPEN_ACADEMIC_YEAR_URL}?page=${page}&limit=${limit}&search=${search}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to direct API call with port 5000');
      // Fallback to direct call with correct port
      const response = await axios.get(`${DIRECT_API_URL}${OPEN_ACADEMIC_YEAR_URL}?page=${page}&limit=${limit}&search=${search}`);
      return response.data;
    }
  },

  getById: async (id) => {
    const response = await api.get(`${ACADEMIC_YEAR_URL}/${id}`);
    return response.data;
  },

  getCurrentYear: async () => {
    try {
      // Try public endpoint first
      const publicResponse = await axios.get(`${DIRECT_API_URL}${PUBLIC_ACADEMIC_YEAR_URL}/current`);
      return publicResponse.data;
    } catch (error) {
      // Fallback to authenticated endpoint
      const response = await api.get(`${ACADEMIC_YEAR_URL}/current/active`);
      return response.data;
    }
  },

  create: async (academicYearData) => {
    try {
      // Try public endpoint first (no auth required)
      console.log('Trying public academic years create endpoint');
      const publicResponse = await axios.post(`${DIRECT_API_URL}${PUBLIC_ACADEMIC_YEAR_URL}`, academicYearData);
      
      if (publicResponse.data && publicResponse.data.success) {
        console.log('Public academic years create succeeded');
        return publicResponse.data;
      }
    } catch (error) {
      console.log('Public create endpoint failed, trying authenticated endpoint');
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.post(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}`, academicYearData, {
          headers
        });
        return response.data;
      } catch (authError) {
        // Fallback to api instance
        const response = await api.post(ACADEMIC_YEAR_URL, academicYearData);
        return response.data;
      }
    }
  },

  update: async (id, academicYearData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}/${id}`, academicYearData, {
        headers
      });
      return response.data;
    } catch (error) {
      // Fallback to api instance
      const response = await api.put(`${ACADEMIC_YEAR_URL}/${id}`, academicYearData);
      return response.data;
    }
  },

  delete: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.delete(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      // Fallback to api instance
      const response = await api.delete(`${ACADEMIC_YEAR_URL}/${id}`);
      return response.data;
    }
  },

  setCurrent: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}/${id}/set-current`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      // Fallback to api instance
      const response = await api.put(`${ACADEMIC_YEAR_URL}/${id}/set-current`);
      return response.data;
    }
  },

  checkDependencies: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${DIRECT_API_URL}${ACADEMIC_YEAR_URL}/${id}/check-dependencies`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      // Fallback to api instance
      const response = await api.post(`${ACADEMIC_YEAR_URL}/${id}/check-dependencies`);
      return response.data;
    }
  }
};

export default AcademicYearService;
