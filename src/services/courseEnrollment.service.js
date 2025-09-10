import api from './api';

const CourseEnrollmentService = {
  // Get all course enrollments with pagination and filters
  getAll: async (page = 1, limit = 10, search = '', courseId = '', academicYearId = '', status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(courseId && { course_id: courseId }),
        ...(academicYearId && { academic_year_id: academicYearId }),
        ...(status && { status })
      });

      const response = await api.get(`/course-enrollments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      throw error;
    }
  },

  // Get course enrollment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/course-enrollments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollment:', error);
      throw error;
    }
  },

  // Get enrollments by student ID
  getByStudentId: async (studentId, page = 1, limit = 10, academicYearId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(academicYearId && { academic_year_id: academicYearId })
      });
      
      const response = await api.get(`/course-enrollments/student/${studentId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      throw error;
    }
  },

  // Get enrollments by course ID
  getByCourseId: async (courseId, page = 1, limit = 10, status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      
      const response = await api.get(`/course-enrollments/course/${courseId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      throw error;
    }
  },
  
  // Get enrollments by subject ID (used in Teacher Subjects page)
  getBySubjectId: async (subjectId, page = 1, limit = 10, status = '', search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(search && { search })
      });
      
      const response = await api.get(`/course-enrollments/subject/${subjectId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject enrollments:', error);
      throw error;
    }
  },
  
  // Get enrollments for subjects taught by a specific teacher
  getByTeacherId: async (teacherId, academicYearId = '', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(academicYearId && { academic_year_id: academicYearId })
      });
      
      const response = await api.get(`/course-enrollments/teacher/${teacherId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher\'s course enrollments:', error);
      throw error;
    }
  },

  // Create new course enrollment
  create: async (enrollmentData) => {
    try {
      const response = await api.post('/course-enrollments', enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating course enrollment:', error);
      throw error;
    }
  },

  // Update course enrollment
  update: async (id, enrollmentData) => {
    try {
      const response = await api.put(`/course-enrollments/${id}`, enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating course enrollment:', error);
      throw error;
    }
  },

  // Delete course enrollment
  delete: async (id) => {
    try {
      const response = await api.delete(`/course-enrollments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course enrollment:', error);
      throw error;
    }
  },

  // Bulk enroll students in a course
  bulkEnroll: async (courseId, studentIds, academicYearId) => {
    try {
      const response = await api.post('/course-enrollments/bulk', {
        course_id: courseId,
        student_ids: studentIds,
        academic_year_id: academicYearId
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      throw error;
    }
  },

  // Update enrollment status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/course-enrollments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      throw error;
    }
  },

  // Get enrollment statistics
  getStatistics: async (academicYearId = '', courseId = '') => {
    try {
      const params = new URLSearchParams({
        ...(academicYearId && { academic_year_id: academicYearId }),
        ...(courseId && { course_id: courseId })
      });

      const response = await api.get(`/course-enrollments/statistics?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment statistics:', error);
      throw error;
    }
  }
};

export default CourseEnrollmentService;
