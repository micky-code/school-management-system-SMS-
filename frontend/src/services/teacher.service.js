import api from './api';

const TEACHER_URL = '/teachers';

const TeacherService = {
  getAll: async (page = 1, limit = 10, search = '', departmentId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(departmentId && { department_id: departmentId })
      });

      const response = await api.get(`${TEACHER_URL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${TEACHER_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  create: async (teacherData) => {
    try {
      const response = await api.post(TEACHER_URL, teacherData);
      return response.data;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  update: async (id, teacherData) => {
    try {
      const response = await api.put(`${TEACHER_URL}/${id}`, teacherData);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${TEACHER_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  // Subject-related methods
  getSubjects: async (teacherId, academicYear = 'current') => {
    try {
      const params = new URLSearchParams({
        academic_year: academicYear
      });
      
      const response = await api.get(`${TEACHER_URL}/${teacherId}/subjects?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      throw error;
    }
  },
  
  // Students related to a teacher's subjects
  getStudents: async (teacherId, subjectId = '') => {
    try {
      const params = new URLSearchParams({
        ...(subjectId && { subject_id: subjectId })
      });
      
      const response = await api.get(`${TEACHER_URL}/${teacherId}/students?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher\'s students:', error);
      throw error;
    }
  },

  // Attendance management
  getAttendanceRecords: async (teacherId, subjectId, date = '') => {
    try {
      const params = new URLSearchParams({
        ...(date && { date })
      });
      
      const response = await api.get(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/attendance?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  },

  markAttendance: async (teacherId, subjectId, attendanceData) => {
    try {
      const response = await api.post(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Grade management
  getGrades: async (teacherId, subjectId, gradeTypeId = '') => {
    try {
      const params = new URLSearchParams({
        ...(gradeTypeId && { grade_type_id: gradeTypeId })
      });
      
      const response = await api.get(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/grades?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  submitGrades: async (teacherId, subjectId, gradesData) => {
    try {
      const response = await api.post(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/grades`, gradesData);
      return response.data;
    } catch (error) {
      console.error('Error submitting grades:', error);
      throw error;
    }
  },
  
  // Teaching Schedule
  getSchedule: async (teacherId, weekStart = '') => {
    try {
      const params = new URLSearchParams({
        ...(weekStart && { week_start: weekStart })
      });
      
      const response = await api.get(`${TEACHER_URL}/${teacherId}/schedule?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      throw error;
    }
  },

  // Teaching materials
  getMaterials: async (teacherId, subjectId) => {
    try {
      const response = await api.get(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teaching materials:', error);
      throw error;
    }
  },

  uploadMaterial: async (teacherId, subjectId, materialData) => {
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      if (materialData.file) {
        formData.append('file', materialData.file);
      }
      formData.append('title', materialData.title);
      formData.append('description', materialData.description);
      formData.append('type', materialData.type);
      
      const response = await api.post(
        `${TEACHER_URL}/${teacherId}/subjects/${subjectId}/materials`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading material:', error);
      throw error;
    }
  },

  deleteMaterial: async (teacherId, subjectId, materialId) => {
    try {
      const response = await api.delete(`${TEACHER_URL}/${teacherId}/subjects/${subjectId}/materials/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },

  // Department related
  getByDepartment: async (departmentId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`${TEACHER_URL}/department/${departmentId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers by department:', error);
      throw error;
    }
  }
};

export default TeacherService;
