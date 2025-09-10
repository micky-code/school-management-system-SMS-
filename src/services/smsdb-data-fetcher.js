/**
 * Comprehensive data fetcher for all frontend pages using smsdb
 * This service provides unified data fetching with fallback mechanisms
 */

import axios from 'axios';

// API Configuration
const API_BASE = 'http://localhost:5000/api';
const PUBLIC_API_BASE = 'http://localhost:5000/api/public';
const PHP_FALLBACK_BASE = '/sms-spi/sms-spi/api';

class SMSDBDataFetcher {
  constructor() {
    this.isBackendOnline = false;
    this.checkBackendStatus();
  }

  // Check if backend server is running
  async checkBackendStatus() {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`, { timeout: 3000 });
      this.isBackendOnline = response.status === 200;
      console.log('✅ Backend server is online');
      return true;
    } catch (error) {
      this.isBackendOnline = false;
      console.log('❌ Backend server is offline, using fallback methods');
      return false;
    }
  }

  // Generic API call with triple fallback
  async fetchData(endpoint, options = {}) {
    const { useAuth = false, params = {}, fallbackData = null } = options;
    
    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Method 1: Try authenticated endpoint
    if (useAuth) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}${fullEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        if (response.data) {
          console.log(`✅ Auth API success: ${endpoint}`);
          return this.normalizeResponse(response.data);
        }
      } catch (error) {
        console.log(`⚠️ Auth API failed: ${endpoint}`, error.message);
      }
    }
    
    // Method 2: Try public endpoint
    try {
      const response = await axios.get(`${PUBLIC_API_BASE}${fullEndpoint}`, { timeout: 5000 });
      
      if (response.data) {
        console.log(`✅ Public API success: ${endpoint}`);
        return this.normalizeResponse(response.data);
      }
    } catch (error) {
      console.log(`⚠️ Public API failed: ${endpoint}`, error.message);
    }
    
    // Method 3: Try PHP fallback
    try {
      const phpEndpoint = `${PHP_FALLBACK_BASE}${endpoint}/public.php${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(phpEndpoint, { timeout: 5000 });
      
      if (response.data) {
        console.log(`✅ PHP fallback success: ${endpoint}`);
        return this.normalizeResponse(response.data);
      }
    } catch (error) {
      console.log(`⚠️ PHP fallback failed: ${endpoint}`, error.message);
    }
    
    // Method 4: Return fallback data or mock data
    if (fallbackData) {
      console.log(`📋 Using fallback data for: ${endpoint}`);
      return { success: true, rows: fallbackData, count: fallbackData.length, _isMockData: true };
    }
    
    throw new Error(`All data fetching methods failed for ${endpoint}`);
  }

  // Normalize different response formats
  normalizeResponse(data) {
    if (data.success !== undefined) {
      return data; // Already in correct format
    }
    
    if (Array.isArray(data)) {
      return { success: true, rows: data, count: data.length };
    }
    
    if (data.data) {
      return { success: true, rows: data.data, count: data.data.length || 1 };
    }
    
    return { success: true, rows: [data], count: 1 };
  }

  // Dashboard Data
  async getDashboardStats() {
    const fallbackStats = {
      students: { total: 8, active: 8, inactive: 0 },
      teachers: { total: 7, active: 7 },
      departments: { total: 6 },
      programs: { total: 8 },
      batches: { total: 8 },
      courses: { total: 14 }
    };

    return await this.fetchData('/dashboard/stats', { 
      useAuth: true, 
      fallbackData: [fallbackStats] 
    });
  }

  // Departments Data
  async getDepartments(page = 1, limit = 10, search = '') {
    const fallbackDepts = [
      { id: 1, department_name: 'Computer Science', teacher_id: 1, name: 'Computer Science' },
      { id: 2, department_name: 'Business Administration', teacher_id: 2, name: 'Business Administration' },
      { id: 3, department_name: 'Engineering', teacher_id: 5, name: 'Engineering' },
      { id: 4, department_name: 'Mathematics', teacher_id: 4, name: 'Mathematics' },
      { id: 5, department_name: 'English Literature', teacher_id: 6, name: 'English Literature' }
    ];

    return await this.fetchData('/departments', {
      params: { page, limit, search },
      fallbackData: fallbackDepts
    });
  }

  // Programs Data
  async getPrograms(page = 1, limit = 10, search = '') {
    const fallbackPrograms = [
      { id: 1, program_name: 'Computer Science Program', department_id: 1, degree_level_id: 1 },
      { id: 2, program_name: 'Business Administration Program', department_id: 2, degree_level_id: 1 },
      { id: 3, program_name: 'Software Engineering Program', department_id: 1, degree_level_id: 1 },
      { id: 4, program_name: 'Information Technology Program', department_id: 1, degree_level_id: 2 }
    ];

    return await this.fetchData('/programs', {
      params: { page, limit, search },
      fallbackData: fallbackPrograms
    });
  }

  // Majors Data
  async getMajors(page = 1, limit = 10, search = '') {
    const fallbackMajors = [
      { id: 1, major_name: 'Software Development', department_id: 1, description: 'Focus on programming and software design' },
      { id: 2, major_name: 'Database Systems', department_id: 1, description: 'Specialization in database design and management' },
      { id: 3, major_name: 'Business Management', department_id: 2, description: 'General business management and leadership' },
      { id: 4, major_name: 'Marketing', department_id: 2, description: 'Marketing strategies and consumer behavior' }
    ];

    return await this.fetchData('/majors', {
      params: { page, limit, search },
      fallbackData: fallbackMajors
    });
  }

  // Students Data
  async getStudents(page = 1, limit = 10, search = '') {
    const fallbackStudents = [
      { id: 1, student_code: 'S2024001', name: 'Alice', surname: 'Johnson', email: 'alice.johnson@student.sms.edu', batch_id: 1, major_id: 1 },
      { id: 2, student_code: 'S2024002', name: 'Bob', surname: 'Wilson', email: 'bob.wilson@student.sms.edu', batch_id: 1, major_id: 1 },
      { id: 3, student_code: 'S2024003', name: 'Carol', surname: 'Brown', email: 'carol.brown@student.sms.edu', batch_id: 2, major_id: 2 },
      { id: 4, student_code: 'S2024004', name: 'David', surname: 'Miller', email: 'david.miller@student.sms.edu', batch_id: 3, major_id: 3 }
    ];

    return await this.fetchData('/students', {
      params: { page, limit, search },
      fallbackData: fallbackStudents
    });
  }

  // Teachers Data
  async getTeachers(page = 1, limit = 10, search = '') {
    const fallbackTeachers = [
      { id: 1, teacher_code: 'T001', first_name: 'John', last_name: 'Doe', email: 'john.doe@sms.edu', department_id: 1 },
      { id: 2, teacher_code: 'T002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@sms.edu', department_id: 2 },
      { id: 3, teacher_code: 'T003', first_name: 'Michael', last_name: 'Johnson', email: 'michael.johnson@sms.edu', department_id: 1 },
      { id: 4, teacher_code: 'T004', first_name: 'Sarah', last_name: 'Davis', email: 'sarah.davis@sms.edu', department_id: 4 }
    ];

    return await this.fetchData('/teachers', {
      params: { page, limit, search },
      fallbackData: fallbackTeachers
    });
  }

  // Courses Data
  async getCourses(page = 1, limit = 10, search = '') {
    const fallbackCourses = [
      { id: 1, course_code: 'CS101', course_name: 'Introduction to Programming', credits: 3, department_id: 1 },
      { id: 2, course_code: 'CS201', course_name: 'Data Structures', credits: 4, department_id: 1 },
      { id: 3, course_code: 'CS301', course_name: 'Database Systems', credits: 3, department_id: 1 },
      { id: 4, course_code: 'BA101', course_name: 'Business Fundamentals', credits: 3, department_id: 2 }
    ];

    return await this.fetchData('/courses', {
      params: { page, limit, search },
      fallbackData: fallbackCourses
    });
  }

  // Batches Data
  async getBatches(page = 1, limit = 10, search = '') {
    const fallbackBatches = [
      { id: 1, name: 'CS-2024-A', code: 'CS24A', program_id: 1, academic_year_id: 1, capacity: 30 },
      { id: 2, name: 'CS-2024-B', code: 'CS24B', program_id: 1, academic_year_id: 1, capacity: 30 },
      { id: 3, name: 'BA-2024-A', code: 'BA24A', program_id: 2, academic_year_id: 1, capacity: 25 },
      { id: 4, name: 'SE-2024-A', code: 'SE24A', program_id: 3, academic_year_id: 1, capacity: 25 }
    ];

    return await this.fetchData('/batches', {
      params: { page, limit, search },
      fallbackData: fallbackBatches
    });
  }

  // Academic Years Data
  async getAcademicYears(page = 1, limit = 10) {
    const fallbackAcademicYears = [
      { id: 1, academic_year: '2024-2025', start_date: '2024-09-01', end_date: '2025-06-30', is_current: 1 },
      { id: 2, academic_year: '2023-2024', start_date: '2023-09-01', end_date: '2024-06-30', is_current: 0 },
      { id: 3, academic_year: '2025-2026', start_date: '2025-09-01', end_date: '2026-06-30', is_current: 0 }
    ];

    return await this.fetchData('/academic-years', {
      params: { page, limit },
      fallbackData: fallbackAcademicYears
    });
  }

  // Degree Levels Data
  async getDegreeLevels() {
    const fallbackDegreeLevels = [
      { id: 1, degree_level_name: 'Bachelor Degree', description: 'Undergraduate 4-year degree program' },
      { id: 2, degree_level_name: 'Associate Degree', description: 'Undergraduate 2-year degree program' },
      { id: 3, degree_level_name: 'Master Degree', description: 'Graduate 2-year degree program' }
    ];

    return await this.fetchData('/degree-levels', {
      fallbackData: fallbackDegreeLevels
    });
  }

  // Subject Assignments Data
  async getSubjectAssignments(page = 1, limit = 10, search = '') {
    const fallbackSubjects = [
      { id: 1, teacher_id: 1, course_id: 1, academic_year_id: 1, semester: 1, batch_id: 1 },
      { id: 2, teacher_id: 1, course_id: 2, academic_year_id: 1, semester: 1, batch_id: 1 },
      { id: 3, teacher_id: 3, course_id: 3, academic_year_id: 1, semester: 1, batch_id: 2 },
      { id: 4, teacher_id: 2, course_id: 4, academic_year_id: 1, semester: 1, batch_id: 3 }
    ];

    return await this.fetchData('/manage-subjects', {
      params: { page, limit, search },
      fallbackData: fallbackSubjects
    });
  }

  // Grades Data
  async getGrades(studentId = null, courseId = null, page = 1, limit = 10) {
    const fallbackGrades = [
      { id: 1, student_id: 1, course_id: 1, grade_type_id: 1, grade_value: 85.5, max_grade: 100.0 },
      { id: 2, student_id: 1, course_id: 1, grade_type_id: 3, grade_value: 92.0, max_grade: 100.0 },
      { id: 3, student_id: 2, course_id: 1, grade_type_id: 1, grade_value: 78.0, max_grade: 100.0 },
      { id: 4, student_id: 3, course_id: 3, grade_type_id: 1, grade_value: 91.0, max_grade: 100.0 }
    ];

    const params = { page, limit };
    if (studentId) params.student_id = studentId;
    if (courseId) params.course_id = courseId;

    return await this.fetchData('/grades', {
      params,
      fallbackData: fallbackGrades
    });
  }

  // Attendance Data
  async getAttendance(studentId = null, courseId = null, date = null, page = 1, limit = 10) {
    const fallbackAttendance = [
      { id: 1, student_id: 1, course_id: 1, attendance_date: '2024-09-02', status: 'present' },
      { id: 2, student_id: 1, course_id: 1, attendance_date: '2024-09-04', status: 'present' },
      { id: 3, student_id: 1, course_id: 1, attendance_date: '2024-09-06', status: 'absent' },
      { id: 4, student_id: 2, course_id: 1, attendance_date: '2024-09-02', status: 'present' }
    ];

    const params = { page, limit };
    if (studentId) params.student_id = studentId;
    if (courseId) params.course_id = courseId;
    if (date) params.date = date;

    return await this.fetchData('/attendance', {
      params,
      fallbackData: fallbackAttendance
    });
  }

  // Fee Payments Data
  async getFeePayments(studentId = null, page = 1, limit = 10) {
    const fallbackPayments = [
      { id: 1, student_id: 1, academic_year_id: 1, semester: 1, fee_type: 'tuition', amount: 2500.00, status: 'paid' },
      { id: 2, student_id: 2, academic_year_id: 1, semester: 1, fee_type: 'tuition', amount: 2500.00, status: 'paid' },
      { id: 3, student_id: 1, academic_year_id: 1, semester: 1, fee_type: 'library', amount: 50.00, status: 'paid' }
    ];

    const params = { page, limit };
    if (studentId) params.student_id = studentId;

    return await this.fetchData('/fee-payments', {
      params,
      fallbackData: fallbackPayments
    });
  }

  // Scholarships Data
  async getScholarships(page = 1, limit = 10) {
    const fallbackScholarships = [
      { id: 1, scholarship_name: 'Academic Excellence', description: 'For outstanding academic performance', amount: 1000.00 },
      { id: 2, scholarship_name: 'Need-Based Aid', description: 'Financial assistance for students in need', amount: 750.00 },
      { id: 3, scholarship_name: 'Merit Scholarship', description: 'For exceptional achievements', amount: 1500.00 }
    ];

    return await this.fetchData('/scholarships', {
      params: { page, limit },
      fallbackData: fallbackScholarships
    });
  }

  // Generic CRUD operations
  async createRecord(endpoint, data) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Create failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async updateRecord(endpoint, id, data) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE}${endpoint}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Update failed for ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  async deleteRecord(endpoint, id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE}${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Delete failed for ${endpoint}/${id}:`, error);
      throw error;
    }
  }
}

export default new SMSDBDataFetcher();
