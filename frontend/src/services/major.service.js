import api from './api';

const MAJOR_URL = '/majors';

const MajorService = {
  getAll: async (page = 1, limit = 10, search = '', departmentId = '') => {
    let url = `${MAJOR_URL}?page=${page}&limit=${limit}&search=${search}`;
    if (departmentId) {
      url += `&departmentId=${departmentId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${MAJOR_URL}/${id}`);
    return response.data;
  },

  create: async (majorData) => {
    const response = await api.post(MAJOR_URL, majorData);
    return response.data;
  },

  update: async (id, majorData) => {
    const response = await api.put(`${MAJOR_URL}/${id}`, majorData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${MAJOR_URL}/${id}`);
    return response.data;
  },

  getByDepartment: async (departmentId) => {
    const response = await api.get(`${MAJOR_URL}/department/${departmentId}`);
    return response.data;
  }
};

export default MajorService;
