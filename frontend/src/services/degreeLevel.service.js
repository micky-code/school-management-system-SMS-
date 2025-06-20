import api from './api';

const DegreeLevelService = {
  getAll: async () => {
    const response = await api.get('/degree-levels');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/degree-levels/${id}`);
    return response.data;
  },

  create: async (degreeLevelData) => {
    const response = await api.post('/degree-levels', degreeLevelData);
    return response.data;
  },

  update: async (id, degreeLevelData) => {
    const response = await api.put(`/degree-levels/${id}`, degreeLevelData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/degree-levels/${id}`);
    return response.data;
  },

  // Get departments by degree level
  getDepartmentsByDegreeLevel: async (degreeLevelId) => {
    const response = await api.get(`/degree-levels/${degreeLevelId}/departments`);
    return response.data;
  },

  // Get programs by degree level
  getProgramsByDegreeLevel: async (degreeLevelId) => {
    const response = await api.get(`/degree-levels/${degreeLevelId}/programs`);
    return response.data;
  }
};

export default DegreeLevelService;
