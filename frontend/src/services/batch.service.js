import api from './api';

const BATCH_URL = '/batches';

const BatchService = {
  getAll: async (page = 1, limit = 10, search = '', programId = '', academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(programId && { program_id: programId }),
        ...(academicYearId && { academic_year_id: academicYearId })
      });

      const response = await api.get(`${BATCH_URL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${BATCH_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  },

  getByProgram: async (programId) => {
    try {
      const response = await api.get(`${BATCH_URL}/program/${programId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batches by program:', error);
      throw error;
    }
  },

  create: async (batchData) => {
    try {
      const response = await api.post(BATCH_URL, batchData);
      return response.data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  update: async (id, batchData) => {
    try {
      const response = await api.put(`${BATCH_URL}/${id}`, batchData);
      return response.data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${BATCH_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }
};

export default BatchService;
