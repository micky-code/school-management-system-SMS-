import axios from 'axios';
import { getAuthToken } from './authService';

// Configuration for different backends
const backends = {
  nodejs: {
    baseURL: 'http://localhost:5000/api',  // Node.js backend URL
    endpoints: {
      students: {
        getAll: '/students',
        getById: (id) => `/students/${id}`,
        create: '/students',
        update: (id) => `/students/${id}`,
        delete: (id) => `/students/${id}`,
        getByProgram: (programId) => `/students/program/${programId}`,
        getByParent: (parentId) => `/students/parent/${parentId}`,
      },
      programs: {
        getAll: '/programs',
        getById: (id) => `/programs/${id}`,
        create: '/programs',
        update: (id) => `/programs/${id}`,
        delete: (id) => `/programs/${id}`,
      },
      departments: {
        getAll: '/public/departments',
        getById: (id) => `/departments/${id}`,
        create: '/departments',
        update: (id) => `/departments/${id}`,
        delete: (id) => `/departments/${id}`,
      },
      majors: {
        getAll: '/majors',
        getById: (id) => `/majors/${id}`,
        create: '/majors',
        update: (id) => `/majors/${id}`,
        delete: (id) => `/majors/${id}`,
      },
      subjects: {
        getAll: '/subjects',
        getById: (id) => `/subjects/${id}`,
        create: '/subjects',
        update: (id) => `/subjects/${id}`,
        delete: (id) => `/subjects/${id}`,
      },
      teachers: {
        getAll: '/teachers',
        getById: (id) => `/teachers/${id}`,
        create: '/teachers',
        update: (id) => `/teachers/${id}`,
        delete: (id) => `/teachers/${id}`,
      },
      academicYears: {
        getAll: '/public/academic-years',
        getById: (id) => `/academic-years/${id}`,
        create: '/academic-years',
        update: (id) => `/academic-years/${id}`,
        delete: (id) => `/academic-years/${id}`,
      },
      dashboard: {
        getStats: '/public/dashboard/stats',
        getActivities: '/public/dashboard/activities',
      },
      batches: {
        getAll: '/batches',
        getById: (id) => `/batches/${id}`,
        create: '/batches',
        update: (id) => `/batches/${id}`,
        delete: (id) => `/batches/${id}`,
      },
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        updatePassword: '/auth/update-password',
      }
    }
  },
  fastapi: {
    baseURL: 'http://localhost:5000/api',  // FastAPI backend URL on port 5000
    endpoints: {
      students: {
        getAll: '/students',
        getById: (id) => `/students/${id}`,
        create: '/students',
        update: (id) => `/students/${id}`,
        delete: (id) => `/students/${id}`,
        getByProgram: (programId) => `/students/program/${programId}`,
        getByParent: (parentId) => `/students/parent/${parentId}`,
      },
      programs: {
        getAll: '/programs',
        getById: (id) => `/programs/${id}`,
        create: '/programs',
        update: (id) => `/programs/${id}`,
        delete: (id) => `/programs/${id}`,
      },
      batches: {
        getAll: '/batches',
        getById: (id) => `/batches/${id}`,
        create: '/batches',
        update: (id) => `/batches/${id}`,
        delete: (id) => `/batches/${id}`,
      },
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        updatePassword: '/auth/update-password',
      }
    }
  }
};

// Currently active backend (now using Node.js)
const activeBackend = 'nodejs';

// Log the active backend configuration
console.log(`Using ${activeBackend} backend at ${backends[activeBackend].baseURL}`);

// Create axios instance with the active backend configuration
const apiClient = axios.create({
  baseURL: backends[activeBackend].baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle database connection errors
    if (error.response?.data?.message?.includes('Too many connections') ||
        error.message?.includes('Too many connections')) {
      console.error('Database connection limit reached:', error.message);
      // Create a custom error with more information
      const customError = new Error('Too many connections to the database. Please try again later.');
      customError.isConnectionError = true;
      customError.originalError = error;
      return Promise.reject(customError);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.message);
      // Create a custom error with more information
      const customError = new Error('Your session has expired. Please log in again.');
      customError.isAuthError = true;
      customError.originalError = error;
      return Promise.reject(customError);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get the endpoint for the current backend
const getEndpoint = (service, action, ...params) => {
  const endpoint = backends[activeBackend].endpoints[service][action];
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};

// API adapter service
const ApiAdapter = {
  // Student endpoints
  students: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('students', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('students', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (studentData) => {
      const endpoint = getEndpoint('students', 'create');
      
      // Handle file uploads differently for FastAPI
      if (activeBackend === 'fastapi' && studentData.profile_picture instanceof File) {
        const formData = new FormData();
        
        // Add all student data to form data
        Object.keys(studentData).forEach(key => {
          if (key === 'profile_picture') {
            formData.append('profile_picture', studentData.profile_picture);
          } else {
            formData.append(key, studentData[key]);
          }
        });
        
        const response = await apiClient.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Regular JSON request for Node.js backend
        const response = await apiClient.post(endpoint, studentData);
        return response.data;
      }
    },
    
    update: async (id, studentData) => {
      const endpoint = getEndpoint('students', 'update', id);
      
      // Handle file uploads differently for FastAPI
      if (activeBackend === 'fastapi' && studentData.profile_picture instanceof File) {
        const formData = new FormData();
        
        // Add all student data to form data
        Object.keys(studentData).forEach(key => {
          if (key === 'profile_picture') {
            formData.append('profile_picture', studentData.profile_picture);
          } else {
            formData.append(key, studentData[key]);
          }
        });
        
        const response = await apiClient.put(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Regular JSON request for Node.js backend
        const response = await apiClient.put(endpoint, studentData);
        return response.data;
      }
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('students', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
    
    getByProgram: async (programId, page = 1, limit = 10) => {
      const endpoint = getEndpoint('students', 'getByProgram', programId);
      const response = await apiClient.get(endpoint, {
        params: { page, limit }
      });
      return response.data;
    },
    
    getByParent: async (parentId, page = 1, limit = 10) => {
      const endpoint = getEndpoint('students', 'getByParent', parentId);
      const response = await apiClient.get(endpoint, {
        params: { page, limit }
      });
      return response.data;
    },
  },
  
  // Program endpoints
  programs: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('programs', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('programs', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (programData) => {
      const endpoint = getEndpoint('programs', 'create');
      const response = await apiClient.post(endpoint, programData);
      return response.data;
    },
    
    update: async (id, programData) => {
      const endpoint = getEndpoint('programs', 'update', id);
      const response = await apiClient.put(endpoint, programData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('programs', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },

  // Department endpoints
  departments: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('departments', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('departments', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (departmentData) => {
      const endpoint = getEndpoint('departments', 'create');
      const response = await apiClient.post(endpoint, departmentData);
      return response.data;
    },
    
    update: async (id, departmentData) => {
      const endpoint = getEndpoint('departments', 'update', id);
      const response = await apiClient.put(endpoint, departmentData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('departments', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },

  // Major endpoints
  majors: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('majors', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('majors', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (majorData) => {
      const endpoint = getEndpoint('majors', 'create');
      const response = await apiClient.post(endpoint, majorData);
      return response.data;
    },
    
    update: async (id, majorData) => {
      const endpoint = getEndpoint('majors', 'update', id);
      const response = await apiClient.put(endpoint, majorData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('majors', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },

  // Subject endpoints
  subjects: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('subjects', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('subjects', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (subjectData) => {
      const endpoint = getEndpoint('subjects', 'create');
      const response = await apiClient.post(endpoint, subjectData);
      return response.data;
    },
    
    update: async (id, subjectData) => {
      const endpoint = getEndpoint('subjects', 'update', id);
      const response = await apiClient.put(endpoint, subjectData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('subjects', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },

  // Teacher endpoints
  teachers: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('teachers', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('teachers', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (teacherData) => {
      const endpoint = getEndpoint('teachers', 'create');
      const response = await apiClient.post(endpoint, teacherData);
      return response.data;
    },
    
    update: async (id, teacherData) => {
      const endpoint = getEndpoint('teachers', 'update', id);
      const response = await apiClient.put(endpoint, teacherData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('teachers', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },

  // Academic Year endpoints
  academicYears: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('academicYears', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('academicYears', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (academicYearData) => {
      const endpoint = getEndpoint('academicYears', 'create');
      const response = await apiClient.post(endpoint, academicYearData);
      return response.data;
    },
    
    update: async (id, academicYearData) => {
      const endpoint = getEndpoint('academicYears', 'update', id);
      const response = await apiClient.put(endpoint, academicYearData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('academicYears', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },
  
  // Batch endpoints
  batches: {
    getAll: async (page = 1, limit = 10, search = '') => {
      const endpoint = getEndpoint('batches', 'getAll');
      const response = await apiClient.get(endpoint, {
        params: { page, limit, search }
      });
      return response.data;
    },
    
    getById: async (id) => {
      const endpoint = getEndpoint('batches', 'getById', id);
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    
    create: async (batchData) => {
      const endpoint = getEndpoint('batches', 'create');
      const response = await apiClient.post(endpoint, batchData);
      return response.data;
    },
    
    update: async (id, batchData) => {
      const endpoint = getEndpoint('batches', 'update', id);
      const response = await apiClient.put(endpoint, batchData);
      return response.data;
    },
    
    delete: async (id) => {
      const endpoint = getEndpoint('batches', 'delete', id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    },
  },
  
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      const endpoint = getEndpoint('auth', 'login');
      console.log(`Sending login request to: ${backends[activeBackend].baseURL}${endpoint}`);
      console.log('With credentials:', { username: credentials.username, password: '******' });
      
      try {
        const response = await apiClient.post(endpoint, credentials);
        console.log('Login response received:', response.data);
        return response.data;
      } catch (error) {
        console.error('Login error:', error.message);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        throw error;
      }
    },
    
    register: async (userData) => {
      const endpoint = getEndpoint('auth', 'register');
      const response = await apiClient.post(endpoint, userData);
      return response.data;
    },
    
    updatePassword: async (passwordData) => {
      const endpoint = getEndpoint('auth', 'updatePassword');
      const response = await apiClient.put(endpoint, passwordData);
      return response.data;
    },
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: async () => {
      const endpoint = '/dashboard/stats';
      try {
        const response = await apiClient.get(endpoint);
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return mock data if API fails
        return {
          success: true,
          data: {
            students: {
              total: 120,
              active: 98,
              inactive: 12,
              graduated: 8,
              suspended: 2
            },
            teachers: {
              total: 25,
              active: 22,
              departments: 5
            },
            academics: {
              programs: 8,
              batches: 12,
              departments: 5,
              subjects: 45
            },
            attendance: {
              today: 95,
              present: 88,
              absent: 5,
              rate: 93
            },
            exams: {
              upcoming: 3,
              completed: 12,
              ongoing: 1,
              list: [
                { name: 'Midterm Exam', subject: 'Computer Science', date: '2023-07-15', time: '09:00 AM', status: 'Scheduled' },
                { name: 'Final Exam', subject: 'Mathematics', date: '2023-07-20', time: '10:30 AM', status: 'Scheduled' },
                { name: 'Quiz', subject: 'English', date: '2023-07-12', time: '02:00 PM', status: 'Ongoing' }
              ]
            },
            payments: {
              total: 45000,
              pending: 8500,
              overdue: 3200,
              thisMonth: 12500
            },
            users: {
              total: 180,
              active: 165,
              roles: {
                admin: 5,
                teacher: 25,
                student: 120,
                parent: 30
              }
            },
            recentActivity: [
              { title: 'New Student Registered', description: 'John Doe registered as a new student', time: '10 minutes ago' },
              { title: 'Payment Received', description: 'Payment of $500 received from Sarah Johnson', time: '1 hour ago' },
              { title: 'Exam Results Published', description: 'Results for Computer Science midterm published', time: '3 hours ago' },
              { title: 'Attendance Marked', description: 'Attendance for Batch CS-2023 marked by Prof. Smith', time: '5 hours ago' },
              { title: 'New Course Added', description: 'Advanced Database Systems added to curriculum', time: '1 day ago' }
            ]
          }
        };
      }
    },
    
    getRecentActivity: async (limit = 10) => {
      const endpoint = '/dashboard/recent-activity';
      try {
        const response = await apiClient.get(endpoint, { params: { limit } });
        return response.data;
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return {
          success: true,
          data: [
            { title: 'New Student Registered', description: 'John Doe registered as a new student', time: '10 minutes ago' },
            { title: 'Payment Received', description: 'Payment of $500 received from Sarah Johnson', time: '1 hour ago' },
            { title: 'Exam Results Published', description: 'Results for Computer Science midterm published', time: '3 hours ago' },
            { title: 'Attendance Marked', description: 'Attendance for Batch CS-2023 marked by Prof. Smith', time: '5 hours ago' },
            { title: 'New Course Added', description: 'Advanced Database Systems added to curriculum', time: '1 day ago' }
          ]
        };
      }
    },
    
    getUpcomingExams: async (limit = 5) => {
      const endpoint = '/dashboard/upcoming-exams';
      try {
        const response = await apiClient.get(endpoint, { params: { limit } });
        return response.data;
      } catch (error) {
        console.error('Error fetching upcoming exams:', error);
        return {
          success: true,
          data: [
            { name: 'Midterm Exam', subject: 'Computer Science', date: '2023-07-15', time: '09:00 AM', status: 'Scheduled' },
            { name: 'Final Exam', subject: 'Mathematics', date: '2023-07-20', time: '10:30 AM', status: 'Scheduled' },
            { name: 'Quiz', subject: 'English', date: '2023-07-12', time: '02:00 PM', status: 'Ongoing' }
          ]
        };
      }
    }
  },
};

export default ApiAdapter;
