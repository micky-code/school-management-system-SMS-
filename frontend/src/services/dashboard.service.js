/**
 * Service for dashboard related operations
 */

import api from './api';

// Mock data for when APIs are not available
const MOCK_DATA = {
  teacherStats: {
    subjects: 5,
    students: 120,
    attendanceRate: 87,
    exams: 3
  },
  subjects: [
    { id: 1, name: 'Mathematics 101', code: 'MATH101', students: 32, schedule: 'Mon, Wed 10:00 AM', status: 'Active' },
    { id: 2, name: 'Introduction to Programming', code: 'CS101', students: 28, schedule: 'Tue, Thu 2:00 PM', status: 'Active' },
    { id: 3, name: 'Data Structures', code: 'CS201', students: 24, schedule: 'Mon, Fri 1:00 PM', status: 'Active' },
    { id: 4, name: 'Database Systems', code: 'CS301', students: 22, schedule: 'Wed, Fri 11:00 AM', status: 'Active' }
  ],
  attendance: [
    { id: 1, date: '2025-06-17', subject: 'Mathematics 101', present: 29, absent: 3 },
    { id: 2, date: '2025-06-18', subject: 'Introduction to Programming', present: 26, absent: 2 },
    { id: 3, date: '2025-06-19', subject: 'Data Structures', present: 22, absent: 2 }
  ],
  events: [
    { id: 1, title: 'Midterm Examination', date: '2025-07-15', type: 'exam' },
    { id: 2, title: 'Project Submission Deadline', date: '2025-07-03', type: 'deadline' },
    { id: 3, title: 'Department Meeting', date: '2025-06-25', type: 'meeting' },
    { id: 4, title: 'Final Examination', date: '2025-08-20', type: 'exam' }
  ]
};

// Helper to add mock flag to returned data
const addMockFlag = (data) => {
  if (!data) return { _isMockData: true };
  
  // For arrays
  if (Array.isArray(data)) {
    const result = [...data];
    result._isMockData = true;
    return result;
  }
  
  // For objects
  return { ...data, _isMockData: true };
};

// Utility function to handle API calls with fallback to mock data
const safeApiCall = async (apiCall, mockData) => {
  try {
    const response = await apiCall();
    if (!response || !response.data) {
      console.warn('API call returned empty data');
      return addMockFlag(mockData);
    }
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data instead:', error);
    return addMockFlag(mockData);
  }
};

class DashboardService {
  // Get teacher dashboard statistics
  async getTeacherStats(teacherId) {
    return await safeApiCall(
      () => api.get(`/stats/teacher/${teacherId}`),
      MOCK_DATA.teacherStats
    );
  }
  
  // Get subjects taught by a teacher
  async getTeacherSubjects(teacherId, page = 1, limit = 5) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return await safeApiCall(
      () => api.get(`/manage-subject/teacher/${teacherId}?${params}`),
      MOCK_DATA.subjects
    );
  }
  
  // Get recent attendance records for a teacher's classes
  async getRecentAttendance(teacherId, limit = 5) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    return await safeApiCall(
      () => api.get(`/attendance/teacher/${teacherId}/recent?${params}`),
      MOCK_DATA.attendance
    );
  }
  
  // Get upcoming events for a teacher
  async getUpcomingEvents(teacherId, limit = 5) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    return await safeApiCall(
      () => api.get(`/events/teacher/${teacherId}?${params}`),
      MOCK_DATA.events
    );
  }
  
  // Get student count by subject for a teacher
  async getStudentCountBySubject(teacherId) {
    return await safeApiCall(
      () => api.get(`/stats/teacher/${teacherId}/students-by-subject`),
      MOCK_DATA.subjects.map(s => ({ subject: s.name, count: s.students }))
    );
  }
  
  // Get attendance statistics for teacher's subjects
  async getAttendanceStats(teacherId) {
    return await safeApiCall(
      () => api.get(`/stats/teacher/${teacherId}/attendance`),
      {
        overall: 87,
        bySubject: MOCK_DATA.subjects.map(s => ({
          subject: s.name,
          rate: 75 + Math.floor(Math.random() * 20)
        }))
      }
    );
  }
  
  // Get exam schedule for teacher
  async getExamSchedule(teacherId) {
    return await safeApiCall(
      () => api.get(`/exams/teacher/${teacherId}/schedule`),
      [
        { id: 1, subject: 'Mathematics 101', date: '2025-07-15', type: 'Midterm', venue: 'Room 101' },
        { id: 2, subject: 'Introduction to Programming', date: '2025-07-17', type: 'Midterm', venue: 'Lab 3' },
        { id: 3, subject: 'Data Structures', date: '2025-07-20', type: 'Assignment', venue: 'Online' },
        { id: 4, subject: 'Database Systems', date: '2025-08-01', type: 'Final Project', venue: 'Lab 2' }
      ]
    );
  }
}

export default new DashboardService();
