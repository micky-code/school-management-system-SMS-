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

      const response = await api.get(`${SUBJECT_URL}?${params}`);
      return response.data;
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
      const response = await api.post(SUBJECT_URL, subjectData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  update: async (id, subjectData) => {
    try {
      const response = await api.put(`${SUBJECT_URL}/${id}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${SUBJECT_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting subject:', error);
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
