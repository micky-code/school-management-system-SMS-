import api from './api';

const StudentStatusService = {
  getAll: async () => {
    const response = await api.get('/student-statuses');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/student-statuses/${id}`);
    return response.data;
  },

  create: async (statusData) => {
    const response = await api.post('/student-statuses', statusData);
    return response.data;
  },

  update: async (id, statusData) => {
    const response = await api.put(`/student-statuses/${id}`, statusData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/student-statuses/${id}`);
    return response.data;
  }
};

export default StudentStatusService;
