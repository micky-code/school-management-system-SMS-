import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost/sms-spi/api/form-handler.php';
const DROPDOWN_API_URL = 'http://localhost/sms-spi/api/dropdown-data.php';

// Create axios instance with auth headers
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Generic CRUD operations for all entities
 */
const formService = {
  /**
   * Create a new record for an entity
   * @param {string} entity - The entity name (students, teachers, etc.)
   * @param {object} data - The form data
   * @returns {Promise} - Promise with the API response
   */
  create: async (entity, data) => {
    try {
      const response = await api.post(`${API_URL}?entity=${entity}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${entity}:`, error);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  /**
   * Get a specific record by ID
   * @param {string} entity - The entity name
   * @param {number} id - The record ID
   * @returns {Promise} - Promise with the API response
   */
  getById: async (entity, id) => {
    try {
      const response = await api.get(`${API_URL}?entity=${entity}&id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${entity}:`, error);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  /**
   * Update an existing record
   * @param {string} entity - The entity name
   * @param {number} id - The record ID
   * @param {object} data - The updated data
   * @returns {Promise} - Promise with the API response
   */
  update: async (entity, id, data) => {
    try {
      const response = await api.put(`${API_URL}?entity=${entity}&id=${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${entity}:`, error);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  /**
   * Delete a record
   * @param {string} entity - The entity name
   * @param {number} id - The record ID
   * @returns {Promise} - Promise with the API response
   */
  deleteById: async (entity, id) => {
    try {
      const response = await api.delete(`${API_URL}?entity=${entity}&id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${entity}:`, error);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  /**
   * Fetch dropdown data for form select fields
   * @param {string} type - The type of dropdown data to fetch (e.g., 'degreeLevels', 'departments')
   * @param {Object} params - Optional parameters (e.g., parentId for dependent dropdowns)
   * @returns {Promise} - Promise with the dropdown data
   */
  fetchDropdownData: async (type, params = {}) => {
    try {
      // Construct query string from params
      const queryParams = new URLSearchParams({ type, ...params }).toString();
      
      const response = await api.get(`${DROPDOWN_API_URL}?${queryParams}`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching ${type} dropdown data:`, error);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  /**
   * Transform API error response into a format suitable for Formik
   * @param {Object} error - The error response from API
   * @returns {Object} - Object with field names as keys and error messages as values
   */
  formatErrors: (error) => {
    const errors = {};
    
    if (error.validation) {
      // Handle validation errors from backend
      Object.entries(error.validation).forEach(([field, message]) => {
        errors[field] = message;
      });
    } else if (error.message) {
      // General error message
      errors.general = error.message;
    } else {
      // Fallback error
      errors.general = 'An unknown error occurred';
    }
    
    return errors;
  }
};

export default formService;
