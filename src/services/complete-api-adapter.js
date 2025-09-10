import axios from 'axios';

// Backend configurations
const backends = {
  nodejs: {
    baseURL: 'http://localhost:5001/api',  // Node.js backend URL on port 5001
    endpoints: {
      // Authentication
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        updatePassword: '/auth/update-password',
      },
      
      // Students Management
      students: {
        getAll: '/students',
        getById: (id) => `/students/${id}`,
        create: '/students',
        update: (id) => `/students/${id}`,
        delete: (id) => `/students/${id}`,
        getByProgram: (programId) => `/students/program/${programId}`,
        getByParent: (parentId) => `/students/parent/${parentId}`,
        uploadProfilePicture: (id) => `/students/${id}/profile-picture`,
      },
      
      // Programs Management
      programs: {
        getAll: '/programs',
        getById: (id) => `/programs/${id}`,
        create: '/programs',
        update: (id) => `/programs/${id}`,
        delete: (id) => `/programs/${id}`,
      },
      
      // Departments Management
      departments: {
        getAll: '/departments',
        getById: (id) => `/departments/${id}`,
        create: '/departments',
        update: (id) => `/departments/${id}`,
        delete: (id) => `/departments/${id}`,
      },
      
      // Teachers Management
      teachers: {
        getAll: '/teachers',
        getById: (id) => `/teachers/${id}`,
        create: '/teachers',
        update: (id) => `/teachers/${id}`,
        delete: (id) => `/teachers/${id}`,
        getByDepartment: (deptId) => `/teachers/department/${deptId}`,
      },
      
      // Batches Management
      batches: {
        getAll: '/batches',
        getById: (id) => `/batches/${id}`,
        create: '/batches',
        update: (id) => `/batches/${id}`,
        delete: (id) => `/batches/${id}`,
        getByProgram: (programId) => `/batches/program/${programId}`,
      },
      
      // Courses Management
      courses: {
        getAll: '/courses',
        getById: (id) => `/courses/${id}`,
        create: '/courses',
        update: (id) => `/courses/${id}`,
        delete: (id) => `/courses/${id}`,
        getByBatch: (batchId) => `/courses/batch/${batchId}`,
        getByTeacher: (teacherId) => `/courses/teacher/${teacherId}`,
      },
      
      // Parents Management
      parents: {
        getAll: '/parents',
        getById: (id) => `/parents/${id}`,
        create: '/parents',
        update: (id) => `/parents/${id}`,
        delete: (id) => `/parents/${id}`,
        getChildren: (parentId) => `/parents/${parentId}/children`,
      },
      
      // Attendance Management
      attendance: {
        getAll: '/attendance',
        getById: (id) => `/attendance/${id}`,
        create: '/attendance',
        createBulk: '/attendance/bulk',
        update: (id) => `/attendance/${id}`,
        delete: (id) => `/attendance/${id}`,
        getByCourse: (courseId) => `/attendance/course/${courseId}`,
        getByStudent: (studentId) => `/attendance/student/${studentId}`,
        getByDate: (date) => `/attendance/date/${date}`,
        getSummary: '/attendance/summary',
      },
      
      // Marks/Grades Management
      marks: {
        getAll: '/grades',
        getById: (id) => `/grades/${id}`,
        create: '/grades',
        createBulk: '/grades/bulk',
        update: (id) => `/grades/${id}`,
        delete: (id) => `/grades/${id}`,
        getByStudent: (studentId) => `/grades/student/${studentId}`,
        getByCourse: (courseId) => `/grades/course/${courseId}`,
        getByExam: (examId) => `/grades/exam/${examId}`,
        getSummary: '/grades/summary',
      },
      
      // Status Management
      status: {
        studentStatuses: '/realtime/status/students',
        userStatuses: '/realtime/status/users',
        academicStatuses: '/realtime/status/academic',
        allStatuses: '/realtime/dashboard/stats',
        systemStatus: '/health',
      },
      
      // Academic Years Management
      academicYears: {
        getAll: '/academic-years',
        getById: (id) => `/academic-years/${id}`,
        create: '/academic-years',
        update: (id) => `/academic-years/${id}`,
        delete: (id) => `/academic-years/${id}`,
        setCurrent: (id) => `/academic-years/${id}/set-current`,
        getCurrent: '/academic-years/current',
      },
      
      // System Utilities
      system: {
        health: '/health',
        testDb: '/test-db',
        degreelevels: '/dropdown/degree-levels',
      }
    }
  },
  fastapi: {
    baseURL: 'http://localhost:5003/api',  // FastAPI backend URL on port 5003
    endpoints: {
      // Authentication
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        updatePassword: '/auth/update-password',
      },
      
      // Students Management
      students: {
        getAll: '/students',
        getById: (id) => `/students/${id}`,
        create: '/students',
        update: (id) => `/students/${id}`,
        delete: (id) => `/students/${id}`,
        getByProgram: (programId) => `/students/program/${programId}`,
        getByParent: (parentId) => `/students/parent/${parentId}`,
        uploadProfilePicture: (id) => `/students/${id}/profile-picture`,
      },
      
      // Programs Management
      programs: {
        getAll: '/programs',
        getById: (id) => `/programs/${id}`,
        create: '/programs',
        update: (id) => `/programs/${id}`,
        delete: (id) => `/programs/${id}`,
      },
      
      // Departments Management
      departments: {
        getAll: '/departments',
        getById: (id) => `/departments/${id}`,
        create: '/departments',
        update: (id) => `/departments/${id}`,
        delete: (id) => `/departments/${id}`,
      },
      
      // Teachers Management
      teachers: {
        getAll: '/teachers',
        getById: (id) => `/teachers/${id}`,
        create: '/teachers',
        update: (id) => `/teachers/${id}`,
        delete: (id) => `/teachers/${id}`,
        getByDepartment: (deptId) => `/teachers/department/${deptId}`,
      },
      
      // Batches Management
      batches: {
        getAll: '/batches',
        getById: (id) => `/batches/${id}`,
        create: '/batches',
        update: (id) => `/batches/${id}`,
        delete: (id) => `/batches/${id}`,
        getByProgram: (programId) => `/batches/program/${programId}`,
      },
      
      // Courses Management
      courses: {
        getAll: '/courses',
        getById: (id) => `/courses/${id}`,
        create: '/courses',
        update: (id) => `/courses/${id}`,
        delete: (id) => `/courses/${id}`,
        getByBatch: (batchId) => `/courses/batch/${batchId}`,
        getByTeacher: (teacherId) => `/courses/teacher/${teacherId}`,
      },
      
      // Parents Management
      parents: {
        getAll: '/parents',
        getById: (id) => `/parents/${id}`,
        create: '/parents',
        update: (id) => `/parents/${id}`,
        delete: (id) => `/parents/${id}`,
        getChildren: (parentId) => `/parents/${parentId}/children`,
      },
      
      // Attendance Management
      attendance: {
        getAll: '/attendance',
        getById: (id) => `/attendance/${id}`,
        create: '/attendance',
        createBulk: '/attendance/bulk',
        update: (id) => `/attendance/${id}`,
        delete: (id) => `/attendance/${id}`,
        getByCourse: (courseId) => `/attendance/course/${courseId}`,
        getByStudent: (studentId) => `/attendance/student/${studentId}`,
        getByDate: (date) => `/attendance/date/${date}`,
        getSummary: '/attendance/summary',
      },
      
      // Marks/Grades Management
      marks: {
        getAll: '/marks',
        getById: (id) => `/marks/${id}`,
        create: '/marks',
        createBulk: '/marks/bulk',
        update: (id) => `/marks/${id}`,
        delete: (id) => `/marks/${id}`,
        getByStudent: (studentId) => `/marks/student/${studentId}`,
        getByCourse: (courseId) => `/marks/course/${courseId}`,
        getByExam: (examId) => `/marks/exam/${examId}`,
        getSummary: '/marks/summary',
      },
      
      // Payments Management
      payments: {
        getAll: '/payments',
        getById: (id) => `/payments/${id}`,
        create: '/payments',
        update: (id) => `/payments/${id}`,
        delete: (id) => `/payments/${id}`,
        getByStudent: (studentId) => `/payments/student/${studentId}`,
        getByAcademicYear: (yearId) => `/payments/academic-year/${yearId}`,
        getSummary: '/payments/summary',
        getFeeStructure: '/payments/fee-structure',
      },
      
      // Exams Management
      exams: {
        getAll: '/exams',
        getById: (id) => `/exams/${id}`,
        create: '/exams',
        update: (id) => `/exams/${id}`,
        delete: (id) => `/exams/${id}`,
        getByCourse: (courseId) => `/exams/course/${courseId}`,
        getByBatch: (batchId) => `/exams/batch/${batchId}`,
        getUpcoming: '/exams/upcoming',
        getSchedule: '/exams/schedule',
      },
      
      // Status Management
      status: {
        studentStatuses: '/status/student-statuses',
        userStatuses: '/status/user-statuses',
        academicStatuses: '/status/academic-statuses',
        allStatuses: '/status/all-statuses',
        systemStatus: '/status/system-status',
      },
      
      // Academic Years Management
      academicYears: {
        getAll: '/academic-years',
        getById: (id) => `/academic-years/${id}`,
        create: '/academic-years',
        update: (id) => `/academic-years/${id}`,
        delete: (id) => `/academic-years/${id}`,
        setCurrent: (id) => `/academic-years/${id}/set-current`,
        getCurrent: '/academic-years/current',
      },
      
      // System Utilities
      system: {
        health: '/health',
        testDb: '/test-db',
        degreelevels: '/degree-levels',
      }
    }
  }
};

// Currently active backend
const activeBackend = 'nodejs';

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
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API adapter object with all methods
const apiAdapter = {
  // Generic HTTP methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // Get current backend configuration
  getConfig: () => backends[activeBackend],
  
  // Get specific endpoint URL
  getEndpoint: (module, action, ...params) => {
    const endpoint = backends[activeBackend].endpoints[module]?.[action];
    if (typeof endpoint === 'function') {
      return endpoint(...params);
    }
    return endpoint;
  },
  
  // Authentication methods
  auth: {
    login: (credentials) => apiClient.post(backends[activeBackend].endpoints.auth.login, credentials),
    register: (userData) => apiClient.post(backends[activeBackend].endpoints.auth.register, userData),
    updatePassword: (passwordData) => apiClient.put(backends[activeBackend].endpoints.auth.updatePassword, passwordData),
  },
  
  // Students methods
  students: {
    getAll: (params = {}) => apiClient.get(backends[activeBackend].endpoints.students.getAll, { params }),
    getById: (id) => apiClient.get(backends[activeBackend].endpoints.students.getById(id)),
    create: (data) => apiClient.post(backends[activeBackend].endpoints.students.create, data),
    update: (id, data) => apiClient.put(backends[activeBackend].endpoints.students.update(id), data),
    delete: (id) => apiClient.delete(backends[activeBackend].endpoints.students.delete(id)),
    getByProgram: (programId) => apiClient.get(backends[activeBackend].endpoints.students.getByProgram(programId)),
    getByParent: (parentId) => apiClient.get(backends[activeBackend].endpoints.students.getByParent(parentId)),
  },
  
  // Programs methods
  programs: {
    getAll: (params = {}) => apiClient.get(backends[activeBackend].endpoints.programs.getAll, { params }),
    getById: (id) => apiClient.get(backends[activeBackend].endpoints.programs.getById(id)),
    create: (data) => apiClient.post(backends[activeBackend].endpoints.programs.create, data),
    update: (id, data) => apiClient.put(backends[activeBackend].endpoints.programs.update(id), data),
    delete: (id) => apiClient.delete(backends[activeBackend].endpoints.programs.delete(id)),
  },
  
  // Departments methods
  departments: {
    getAll: (params = {}) => apiClient.get(backends[activeBackend].endpoints.departments.getAll, { params }),
    getById: (id) => apiClient.get(backends[activeBackend].endpoints.departments.getById(id)),
    create: (data) => apiClient.post(backends[activeBackend].endpoints.departments.create, data),
    update: (id, data) => apiClient.put(backends[activeBackend].endpoints.departments.update(id), data),
    delete: (id) => apiClient.delete(backends[activeBackend].endpoints.departments.delete(id)),
  },
  
  // Status methods
  status: {
    getStudentStatuses: () => apiClient.get(backends[activeBackend].endpoints.status.studentStatuses),
    getUserStatuses: () => apiClient.get(backends[activeBackend].endpoints.status.userStatuses),
    getAcademicStatuses: () => apiClient.get(backends[activeBackend].endpoints.status.academicStatuses),
    getAllStatuses: (category = '') => {
      const url = backends[activeBackend].endpoints.status.allStatuses;
      return apiClient.get(category ? `${url}?category=${category}` : url);
    },
    getSystemStatus: () => apiClient.get(backends[activeBackend].endpoints.status.systemStatus),
  },
  
  // Academic Years methods
  academicYears: {
    getAll: (params = {}) => apiClient.get(backends[activeBackend].endpoints.academicYears.getAll, { params }),
    getById: (id) => apiClient.get(backends[activeBackend].endpoints.academicYears.getById(id)),
    create: (data) => apiClient.post(backends[activeBackend].endpoints.academicYears.create, data),
    update: (id, data) => apiClient.put(backends[activeBackend].endpoints.academicYears.update(id), data),
    delete: (id) => apiClient.delete(backends[activeBackend].endpoints.academicYears.delete(id)),
    setCurrent: (id) => apiClient.put(backends[activeBackend].endpoints.academicYears.setCurrent(id)),
    getCurrent: () => apiClient.get(backends[activeBackend].endpoints.academicYears.getCurrent),
  },
  
  // System methods
  system: {
    health: () => apiClient.get(backends[activeBackend].endpoints.system.health),
    testDb: () => apiClient.get(backends[activeBackend].endpoints.system.testDb),
    getDegreelevels: () => apiClient.get(backends[activeBackend].endpoints.system.degreelevels),
  }
};

export { apiAdapter, apiClient };
export default apiAdapter;
