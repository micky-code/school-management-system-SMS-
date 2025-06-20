import api from './api';

const MaritalStatusService = {
  getAll: async () => {
    const response = await api.get('/marital-statuses');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/marital-statuses/${id}`);
    return response.data;
  },

  create: async (statusData) => {
    const response = await api.post('/marital-statuses', statusData);
    return response.data;
  },

  update: async (id, statusData) => {
    const response = await api.put(`/marital-statuses/${id}`, statusData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/marital-statuses/${id}`);
    return response.data;
  }
};

export default MaritalStatusService;
