import api from './api';
import axios from 'axios';

const DIRECT_API_URL = 'http://localhost:5000/api';

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

      // First try with the api instance
      const response = await api.get(`${TEACHER_URL}?${params}`);
      console.log('Teacher API response:', response.data);
      
      // Handle different response formats (Node.js vs FastAPI)
      if (response.data && response.data.data) {
        // FastAPI format with data property
        return {
          rows: response.data.data || [],
          count: response.data.total || 0
        };
      } else if (response.data && Array.isArray(response.data.rows)) {
        // Node.js format with rows property
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Simple array format
        return {
          rows: response.data,
          count: response.data.length
        };
      }
      // Default empty response
      return { rows: [], count: 0 };
    } catch (error) {
      console.error('Error fetching teachers with api instance:', error);
      
      try {
        console.log('Falling back to direct API call with port 5000');
        // Fallback to direct call with correct port
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(departmentId && { department_id: departmentId })
        });
        
        const response = await axios.get(`${DIRECT_API_URL}${TEACHER_URL}?${params}`, { headers });
        console.log('Teacher direct API response:', response.data);
        
        // Handle different response formats
        if (response.data && response.data.data) {
          return {
            rows: response.data.data || [],
            count: response.data.total || 0
          };
        } else if (response.data && Array.isArray(response.data.rows)) {
          return response.data;
        } else if (Array.isArray(response.data)) {
          return {
            rows: response.data,
            count: response.data.length
          };
        }
        return { rows: [], count: 0 };
      } catch (fallbackError) {
        console.error('Error in fallback API call for teachers:', fallbackError);
        // Return empty data instead of throwing error
        return { rows: [], count: 0 };
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${TEACHER_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher with api instance:', error);
      
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${DIRECT_API_URL}${TEACHER_URL}/${id}`, { headers });
        return response.data;
      } catch (fallbackError) {
        console.error('Error in fallback API call for teacher details:', fallbackError);
        throw fallbackError;
      }
    }
  },

  create: async (teacherData) => {
    try {
      const response = await api.post(TEACHER_URL, teacherData);
      return response.data;
    } catch (error) {
      console.error('Error creating teacher with api instance:', error);
      
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.post(`${DIRECT_API_URL}${TEACHER_URL}`, teacherData, { headers });
        return response.data;
      } catch (fallbackError) {
        console.error('Error in fallback API call for creating teacher:', fallbackError);
        throw fallbackError;
      }
    }
  },

  update: async (id, teacherData) => {
    try {
      const response = await api.put(`${TEACHER_URL}/${id}`, teacherData);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher with api instance:', error);
      
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.put(`${DIRECT_API_URL}${TEACHER_URL}/${id}`, teacherData, { headers });
        return response.data;
      } catch (fallbackError) {
        console.error('Error in fallback API call for updating teacher:', fallbackError);
        throw fallbackError;
      }
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${TEACHER_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting teacher with api instance:', error);
      
      try {
        console.log('Falling back to direct API call with port 5000');
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.delete(`${DIRECT_API_URL}${TEACHER_URL}/${id}`, { headers });
        return response.data;
      } catch (fallbackError) {
        console.error('Error in fallback API call for deleting teacher:', fallbackError);
        throw fallbackError;
      }
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
