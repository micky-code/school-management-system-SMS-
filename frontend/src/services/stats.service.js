import api from './api';

const statsService = {
  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get student stats
  getStudentStats: async () => {
    try {
      const response = await api.get('/stats/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  }
};

export default statsService;
