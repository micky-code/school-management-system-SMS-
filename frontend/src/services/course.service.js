import api from './api';

const CourseService = {
  // Get all courses with pagination and filters
  getAll: async (page = 1, limit = 10, search = '', departmentId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(departmentId && { department_id: departmentId })
      });

      const response = await api.get(`/courses?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get courses by department
  getByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/courses/department/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      throw error;
    }
  },

  // Get courses by program
  getByProgram: async (programId) => {
    try {
      const response = await api.get(`/courses/program/${programId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by program:', error);
      throw error;
    }
  },

  // Create new course
  create: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update course
  update: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete course
  delete: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Get course prerequisites
  getPrerequisites: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/prerequisites`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course prerequisites:', error);
      throw error;
    }
  },

  // Add course prerequisite
  addPrerequisite: async (courseId, prerequisiteId) => {
    try {
      const response = await api.post(`/courses/${courseId}/prerequisites`, {
        prerequisite_id: prerequisiteId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding course prerequisite:', error);
      throw error;
    }
  },

  // Remove course prerequisite
  removePrerequisite: async (courseId, prerequisiteId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/prerequisites/${prerequisiteId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing course prerequisite:', error);
      throw error;
    }
  }
};

export default CourseService;
