import ApiAdapter from './api-adapter';

// Keep the original api import for backward compatibility during transition
import api from './api';

const PROGRAM_URL = '/programs';

const ProgramService = {
  // Basic CRUD operations with error handling
  getAll: async (page = 1, limit = 10, search = '', departmentId = '', degreeLevelId = '') => {
    try {
      // Use ApiAdapter for better compatibility with both backends
      return await ApiAdapter.programs.getAll(page, limit, search);
    } catch (error) {
      console.error('Error fetching programs:', error);
      // Return a default structure to prevent UI crashes
      return {
        success: false,
        count: 0,
        totalPages: 1,
        currentPage: page,
        data: [],
        error: error.message || 'Failed to fetch programs'
      };
    }
  },

  getById: async (id) => {
    try {
      return await ApiAdapter.programs.getById(id);
    } catch (error) {
      console.error('Error fetching program:', error);
      throw error;
    }
  },

  create: async (programData) => {
    try {
      return await ApiAdapter.programs.create(programData);
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },

  update: async (id, programData) => {
    try {
      return await ApiAdapter.programs.update(id, programData);
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await ApiAdapter.programs.delete(id);
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  },

  // Academic hierarchy related methods
  getByDepartment: async (departmentId, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get(`${PROGRAM_URL}/department/${departmentId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching programs by department:', error);
      throw error;
    }
  },

  getByDegreeLevel: async (degreeLevelId, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get(`${PROGRAM_URL}/degree-level/${degreeLevelId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching programs by degree level:', error);
      throw error;
    }
  },
  
  // Related data methods
  getSubjects: async (programId, page = 1, limit = 20, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(academicYearId && { academic_year_id: academicYearId })
      });

      const response = await api.get(`${PROGRAM_URL}/${programId}/subjects?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program subjects:', error);
      throw error;
    }
  },

  getStudents: async (programId, page = 1, limit = 20, batchId = '', status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(batchId && { batch_id: batchId }),
        ...(status && { status })
      });

      const response = await api.get(`${PROGRAM_URL}/${programId}/students?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program students:', error);
      throw error;
    }
  },
  
  getBatches: async (programId) => {
    try {
      const response = await api.get(`${PROGRAM_URL}/${programId}/batches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program batches:', error);
      throw error;
    }
  },
  
  // Program statistics
  getStatistics: async (programId) => {
    try {
      const response = await api.get(`${PROGRAM_URL}/${programId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program statistics:', error);
      throw error;
    }
  },
  
  // Update program status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`${PROGRAM_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating program status:', error);
      throw error;
    }
  },
  
  // Program curriculum management
  getCurriculum: async (programId, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        ...(academicYearId && { academic_year_id: academicYearId })
      });

      const response = await api.get(`${PROGRAM_URL}/${programId}/curriculum?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program curriculum:', error);
      throw error;
    }
  },
  
  // Get all active programs (no pagination, for dropdowns)
  getAllActive: async () => {
    try {
      const response = await api.get(`${PROGRAM_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active programs:', error);
      throw error;
    }
  }
};

export default ProgramService;
