import api from './api';

const AdmissionService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    let url = `/admissions?page=${page}&limit=${limit}&search=${search}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admissions/${id}`);
    return response.data;
  },

  create: async (admissionData) => {
    const response = await api.post('/admissions', admissionData);
    return response.data;
  },

  update: async (id, admissionData) => {
    const response = await api.put(`/admissions/${id}`, admissionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admissions/${id}`);
    return response.data;
  },

  getCurrent: async () => {
    const response = await api.get('/admissions/current');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/admissions/active');
    return response.data;
  }
};

export default AdmissionService;
