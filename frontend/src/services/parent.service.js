import api from './api';

const PARENT_URL = '/parents';

const ParentService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`${PARENT_URL}?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${PARENT_URL}/${id}`);
    return response.data;
  },

  create: async (parentData) => {
    const response = await api.post(PARENT_URL, parentData);
    return response.data;
  },

  update: async (id, parentData) => {
    const response = await api.put(`${PARENT_URL}/${id}`, parentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${PARENT_URL}/${id}`);
    return response.data;
  }
};

export default ParentService;
