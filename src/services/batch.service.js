import ApiAdapter from './api-adapter';

// Keep the original api import for backward compatibility during transition
import api from './api';

const BATCH_URL = '/batches';

const BatchService = {
  getAll: async (page = 1, limit = 10, search = '', programId = '', academicYearId = '') => {
    try {
      // Use ApiAdapter for better compatibility with both backends
      return await ApiAdapter.batches.getAll(page, limit, search);
    } catch (error) {
      console.error('Error fetching batches:', error);
      // Return a default structure to prevent UI crashes
      return {
        success: false,
        count: 0,
        totalPages: 1,
        currentPage: page,
        data: [],
        error: error.message || 'Failed to fetch batches'
      };
    }
  },

  getById: async (id) => {
    try {
      return await ApiAdapter.batches.getById(id);
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  },

  getByProgram: async (programId) => {
    try {
      // Use ApiAdapter for better compatibility with both backends
      if (ApiAdapter.batches.getByProgram) {
        return await ApiAdapter.batches.getByProgram(programId);
      } else {
        // Fallback to original API if adapter doesn't support this method yet
        const response = await api.get(`${BATCH_URL}/program/${programId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching batches by program:', error);
      throw error;
    }
  },

  create: async (batchData) => {
    try {
      return await ApiAdapter.batches.create(batchData);
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  update: async (id, batchData) => {
    try {
      return await ApiAdapter.batches.update(id, batchData);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await ApiAdapter.batches.delete(id);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }
};

export default BatchService;
