import api from './api';

const SUBJECT_URL = '/subjects';

const SubjectService = {
  getAll: async (page = 1, limit = 10, search = '', departmentId = '', academicYearId = '', status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(departmentId && { department_id: departmentId }),
        ...(academicYearId && { academic_year_id: academicYearId }),
        ...(status && { status })
      });

      // Try authenticated endpoint first
      try {
        const response = await api.get(`${SUBJECT_URL}?${params}`);
        return response.data;
      } catch (authError) {
        console.log('Authenticated subjects endpoint failed, trying public endpoint');
        // Fallback to public endpoint
        const publicResponse = await api.get(`${SUBJECT_URL}/public?${params}`);
        return publicResponse.data;
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${SUBJECT_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  },

  getByDepartment: async (departmentId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`${SUBJECT_URL}/department/${departmentId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects by department:', error);
      throw error;
    }
  },

  getByTeacher: async (teacherId, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        ...(academicYearId && { academic_year_id: academicYearId })
      });
      
      const response = await api.get(`${SUBJECT_URL}/teacher/${teacherId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects by teacher:', error);
      throw error;
    }
  },

  getByProgram: async (programId, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        ...(academicYearId && { academic_year_id: academicYearId })
      });
      
      const response = await api.get(`${SUBJECT_URL}/program/${programId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects by program:', error);
      throw error;
    }
  },
  
  getEnrolledStudents: async (subjectId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/students?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      throw error;
    }
  },

  getMaterials: async (subjectId) => {
    try {
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject materials:', error);
      throw error;
    }
  },

  getSchedule: async (subjectId) => {
    try {
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject schedule:', error);
      throw error;
    }
  },

  getAssignedTeachers: async (subjectId) => {
    try {
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/teachers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned teachers:', error);
      throw error;
    }
  },

  create: async (subjectData) => {
    try {
      // Map frontend field names to backend field names
      const mappedData = {
        subject_code: subjectData.code,
        subject_name: subjectData.name,
        credit: subjectData.credits,
        description: subjectData.description,
        major_id: subjectData.major_id
      };
      
      const response = await api.post(SUBJECT_URL, mappedData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      
      // Handle authentication errors gracefully
      if (error.isAuthError || error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Handle permission errors
      if (error.isPermissionError || error.response?.status === 403) {
        throw new Error('You do not have permission to create subjects.');
      }
      
      throw error;
    }
  },

  update: async (id, subjectData) => {
    try {
      // Map frontend field names to backend field names
      const mappedData = {
        subject_code: subjectData.code,
        subject_name: subjectData.name,
        credit: subjectData.credits,
        description: subjectData.description,
        major_id: subjectData.major_id
      };
      
      const response = await api.put(`${SUBJECT_URL}/${id}`, mappedData);
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      
      // Handle authentication errors gracefully
      if (error.isAuthError || error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Handle permission errors
      if (error.isPermissionError || error.response?.status === 403) {
        throw new Error('You do not have permission to update subjects.');
      }
      
      // Handle dependency errors
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        throw new Error('Subject code already exists. Please use a different code.');
      }
      
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${SUBJECT_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting subject:', error);
      
      // Handle authentication errors gracefully
      if (error.isAuthError || error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Handle permission errors
      if (error.isPermissionError || error.response?.status === 403) {
        throw new Error('You do not have permission to delete subjects.');
      }
      
      // Handle dependency errors
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Cannot delete')) {
        throw new Error('Cannot delete subject. It has dependencies (classes, enrollments, or teacher assignments).');
      }
      
      throw error;
    }
  },

  assignTeacher: async (subjectId, teacherId, data = {}) => {
    try {
      const response = await api.post(`${SUBJECT_URL}/${subjectId}/teachers/${teacherId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error assigning teacher to subject:', error);
      throw error;
    }
  },

  removeTeacher: async (subjectId, teacherId) => {
    try {
      const response = await api.delete(`${SUBJECT_URL}/${subjectId}/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing teacher from subject:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`${SUBJECT_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating subject status:', error);
      throw error;
    }
  },

  // Prerequisites management
  getPrerequisites: async (subjectId) => {
    try {
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/prerequisites`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject prerequisites:', error);
      throw error;
    }
  },

  addPrerequisite: async (subjectId, prerequisiteId) => {
    try {
      const response = await api.post(`${SUBJECT_URL}/${subjectId}/prerequisites/${prerequisiteId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding subject prerequisite:', error);
      throw error;
    }
  },

  removePrerequisite: async (subjectId, prerequisiteId) => {
    try {
      const response = await api.delete(`${SUBJECT_URL}/${subjectId}/prerequisites/${prerequisiteId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing subject prerequisite:', error);
      throw error;
    }
  },
  
  // Get enrollment statistics
  getEnrollmentStats: async (subjectId, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        ...(academicYearId && { academic_year_id: academicYearId })
      });
      
      const response = await api.get(`${SUBJECT_URL}/${subjectId}/enrollment-stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment statistics:', error);
      throw error;
    }
  }
};

export default SubjectService;
