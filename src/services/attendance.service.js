import api from './api';

const ATTENDANCE_URL = '/attendance';

const AttendanceService = {
  getAll: async (page = 1, limit = 10, search = '', courseId = '', batchId = '', date = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(courseId && { course_id: courseId }),
        ...(batchId && { batch_id: batchId }),
        ...(date && { date })
      });

      const response = await api.get(`${ATTENDANCE_URL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${ATTENDANCE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      throw error;
    }
  },

  getByStudent: async (studentId, startDate = '', endDate = '') => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      const response = await api.get(`${ATTENDANCE_URL}/student/${studentId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  },

  getByCourse: async (courseId, date = '') => {
    try {
      const params = new URLSearchParams({
        ...(date && { date })
      });

      const response = await api.get(`${ATTENDANCE_URL}/course/${courseId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course attendance:', error);
      throw error;
    }
  },

  getAttendanceReport: async (courseId, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        course_id: courseId,
        start_date: startDate,
        end_date: endDate
      });

      const response = await api.get(`${ATTENDANCE_URL}/report?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },

  getAttendanceStats: async (studentId = '', courseId = '', startDate = '', endDate = '') => {
    try {
      const params = new URLSearchParams({
        ...(studentId && { student_id: studentId }),
        ...(courseId && { course_id: courseId }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      const response = await api.get(`${ATTENDANCE_URL}/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  },

  create: async (attendanceData) => {
    try {
      const response = await api.post(ATTENDANCE_URL, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw error;
    }
  },

  bulkCreate: async (attendanceRecords) => {
    try {
      const response = await api.post(`${ATTENDANCE_URL}/bulk`, { records: attendanceRecords });
      return response.data;
    } catch (error) {
      console.error('Error creating bulk attendance records:', error);
      throw error;
    }
  },

  update: async (id, attendanceData) => {
    try {
      const response = await api.put(`${ATTENDANCE_URL}/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  },

  updateStatus: async (id, status, notes = '') => {
    try {
      const response = await api.patch(`${ATTENDANCE_URL}/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Error updating attendance status:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${ATTENDANCE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  },

  markAttendanceForClass: async (courseId, date, attendanceList) => {
    try {
      const response = await api.post(`${ATTENDANCE_URL}/class`, {
        course_id: courseId,
        date,
        attendance_list: attendanceList
      });
      return response.data;
    } catch (error) {
      console.error('Error marking class attendance:', error);
      throw error;
    }
  }
};

export default AttendanceService;
