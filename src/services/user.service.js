import api from './api';

const UserService = {
  getAll: async (page = 1, limit = 10, search = '', role_id = '') => {
    let url = `/users?page=${page}&limit=${limit}&search=${search}`;
    if (role_id) {
      url += `&role_id=${role_id}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getByRole: async (roleId) => {
    const response = await api.get(`/users/role/${roleId}`);
    return response.data;
  },

  getStudentUsers: async () => {
    const response = await api.get('/users/students');
    return response.data;
  },

  updatePassword: async (id, passwordData) => {
    const response = await api.put(`/users/${id}/password`, passwordData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  }
};

export default UserService;
