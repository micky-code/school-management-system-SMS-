import api from './api';

const DEPARTMENT_URL = '/departments';

const DepartmentService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`${DEPARTMENT_URL}?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${DEPARTMENT_URL}/${id}`);
    return response.data;
  },

  create: async (departmentData) => {
    const response = await api.post(DEPARTMENT_URL, departmentData);
    return response.data;
  },

  update: async (id, departmentData) => {
    const response = await api.put(`${DEPARTMENT_URL}/${id}`, departmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${DEPARTMENT_URL}/${id}`);
    return response.data;
  }
};

export default DepartmentService;
