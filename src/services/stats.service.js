import axios from 'axios';
// Real-time service removed

// Real-time API functionality removed

// Mock data for dashboards
const mockAdminDashboardStats = {
  totalStudents: 1250,
  activeStudents: 1180,
  totalTeachers: 75,
  totalPrograms: 12,
  recentEnrollments: 45,
  currentAcademicYear: '2024-2025',
  studentsByProgram: [
    { programName: 'Bachelor of Information Technology', count: 320 },
    { programName: 'Bachelor of Business Administration', count: 280 },
    { programName: 'Associate Degree in Software Development', count: 150 },
    { programName: 'Bachelor of English Literature', count: 120 }
  ],
  recentActivity: [
    { 
      name: 'John Doe',
      action: 'enrolled in Bachelor of IT',
      created_at: '2024-06-30 14:25:00',
      type: 'enrollment'
    },
    { 
      name: 'Sarah Smith',
      action: 'recorded attendance for Web Development class',
      created_at: '2024-06-30 10:15:00',
      type: 'attendance'
    },
    { 
      name: 'Mike Johnson',
      action: 'submitted grades for Database Systems',
      created_at: '2024-06-29 16:30:00',
      type: 'grade'
    }
  ]
};

const mockStudentDashboardStats = {
  studentInfo: {
    name: 'Dara Sok',
    id: 'S2023001',
    program: 'Bachelor of Information Technology',
    batch: '2023-2027',
    gpa: 3.75
  },
  attendance: { present: 92, absent: 3, late: 4, excused: 1 },
  courses: [
    { code: 'CS101', name: 'Introduction to Programming', grade: 'A', credits: 3 },
    { code: 'CS102', name: 'Data Structures', grade: 'A-', credits: 3 }
  ]
};

const mockTeacherDashboardStats = {
  teacherInfo: {
    name: 'Sopheap Keo',
    id: 'T2020005',
    department: 'Information Technology',
    courses: 4
  },
  courseLoad: { currentCourses: 4, totalStudents: 120 }
};

const mockParentDashboardStats = {
  parentInfo: {
    name: 'Chanthy Meas',
    id: 'P2023010',
    children: 2
  }
};

// Helper function to add mock flag
const addMockFlag = (data) => {
  return {
    ...data,
    _isMockData: true
  };
};

// Helper function for API calls that prioritizes real data
// Helper function to validate and normalize activity data
const normalizeActivity = (activity) => {
  if (!activity || typeof activity !== 'object') {
    return null;
  }
  return {
    name: activity.name || 'Unknown User',
    action: activity.action || 'performed an action',
    created_at: activity.created_at || new Date().toISOString(),
    type: activity.type || 'action'
  };
};

// Helper function to validate and normalize dashboard stats
const normalizeDashboardStats = (data) => {
  const stats = {
    totalStudents: parseInt(data?.totalStudents) || 0,
    activeStudents: parseInt(data?.activeStudents) || 0,
    totalTeachers: parseInt(data?.totalTeachers) || 0,
    totalPrograms: parseInt(data?.totalPrograms) || 0,
    recentEnrollments: parseInt(data?.recentEnrollments) || 0,
    currentYear: data?.currentAcademicYear || '',
    studentsByProgram: Array.isArray(data?.studentsByProgram) ? data.studentsByProgram : [],
    recentActivity: []
  };

  // Normalize activity data
  if (Array.isArray(data?.recentActivity)) {
    stats.recentActivity = data.recentActivity
      .map(normalizeActivity)
      .filter(Boolean); // Remove null values
  }

  return stats;
};

const safeApiCall = async (apiCall, mockData) => {
  try {
    const response = await apiCall();
    if (!response || !response.data) {
      console.error('API call returned empty data');
      throw new Error('Failed to load data from database');
    }
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error; // Propagate the error to be handled by the UI
  }
};

// Stats service object
const statsService = {
  // Get admin dashboard stats
  async getAdminDashboardStats() {
    try {
      // Try the authenticated Node.js API first (most reliable for real data)
      try {
        console.log('Attempting to fetch dashboard stats from authenticated Node.js API...');
        const token = localStorage.getItem('token');
        
        // Create a custom axios instance for this request to prevent global interceptor redirects
        const customAxios = axios.create({
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Add custom response interceptor to handle auth errors without redirects
        customAxios.interceptors.response.use(
          response => response,
          error => {
            if (error.response && error.response.status === 401) {
              // Mark this as an auth error but don't redirect
              console.log('Authentication error in stats service, not redirecting');
              error.isAuthError = true;
            }
            return Promise.reject(error);
          }
        );
        
        const apiResponse = await customAxios.get('http://localhost:5000/api/dashboard/stats');
        
        if (apiResponse.data && apiResponse.data.success) {
          console.log('Successfully fetched dashboard stats from Node.js API');
          const normalizedStats = normalizeDashboardStats(apiResponse.data.data);
          return {
            ...normalizedStats,
            isMockData: false
          };
        }
        throw new Error('API returned unsuccessful response');
      } catch (apiError) {
        console.error('Node.js API failed:', apiError);
        
        // Check if this is an auth error
        if (apiError.isAuthError || (apiError.response && apiError.response.status === 401)) {
          // Propagate the auth error to the component
          apiError.isAuthError = true;
          throw apiError;
        }
        
        // All real-time services and PHP fallback removed
        console.log('API failed and no fallback available, using mock data');
        
        // Return normalized mock data with proper structure and flag
        const normalizedStats = normalizeDashboardStats(mockAdminDashboardStats);
        const mockData = {
          ...normalizedStats,
          isMockData: true
        };
        console.log('Returning normalized mock data:', mockData);
        return mockData;
      }
    } catch (error) {
      // If this is an auth error, propagate it
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        error.isAuthError = true;
        throw error;
      }
      
      console.error('Error in getAdminDashboardStats:', error);
      return addMockFlag(mockAdminDashboardStats);
    }
  },

  // Legacy function for backward compatibility
  async getStats() {
    try {
      return await this.getAdminDashboardStats();
    } catch (error) {
      console.error('Error in getStats:', error);
      return addMockFlag(mockAdminDashboardStats);
    }
  },

  // Get student dashboard stats
  async getStudentStats(studentId = 1) {
    try {
      const token = localStorage.getItem('token');
      
      // Create a custom axios instance for this request to prevent global interceptor redirects
      const customAxios = axios.create({
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add custom response interceptor to handle auth errors without redirects
      customAxios.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            // Mark this as an auth error but don't redirect
            console.log('Authentication error in student stats service, not redirecting');
            error.isAuthError = true;
          }
          return Promise.reject(error);
        }
      );
      
      const response = await customAxios.get(`http://localhost:5000/api/students/${studentId}/dashboard`);
      return response.data;
    } catch (error) {
      // If this is an auth error, propagate it
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        error.isAuthError = true;
        throw error;
      }
      
      console.error('Error fetching student stats:', error);
      return addMockFlag(mockStudentDashboardStats);
    }
  },

  // Get parent dashboard stats
  async getParentStats(parentId = 1) {
    try {
      const token = localStorage.getItem('token');
      
      // Create a custom axios instance for this request to prevent global interceptor redirects
      const customAxios = axios.create({
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add custom response interceptor to handle auth errors without redirects
      customAxios.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            // Mark this as an auth error but don't redirect
            console.log('Authentication error in parent stats service, not redirecting');
            error.isAuthError = true;
          }
          return Promise.reject(error);
        }
      );
      
      const response = await customAxios.get(`http://localhost:5000/api/parents/${parentId}/dashboard`);
      return response.data;
    } catch (error) {
      // If this is an auth error, propagate it
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        error.isAuthError = true;
        throw error;
      }
      
      console.error('Error fetching parent stats:', error);
      return addMockFlag(mockParentDashboardStats);
    }
  },

  // Get teacher dashboard stats
  async getTeacherStats(teacherId = 1) {
    try {
      const token = localStorage.getItem('token');
      
      // Create a custom axios instance for this request to prevent global interceptor redirects
      const customAxios = axios.create({
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add custom response interceptor to handle auth errors without redirects
      customAxios.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            // Mark this as an auth error but don't redirect
            console.log('Authentication error in teacher stats service, not redirecting');
            error.isAuthError = true;
          }
          return Promise.reject(error);
        }
      );
      
      const response = await customAxios.get(`http://localhost:5000/api/teachers/${teacherId}/dashboard`);
      return response.data;
    } catch (error) {
      // If this is an auth error, propagate it
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        error.isAuthError = true;
        throw error;
      }
      
      console.error('Error fetching teacher stats:', error);
      return addMockFlag(mockTeacherDashboardStats);
    }
  }
};

export default statsService;
