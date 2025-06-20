import api from './api';

const ACADEMIC_YEAR_URL = '/academic-years';

const AcademicYearService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`${ACADEMIC_YEAR_URL}?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${ACADEMIC_YEAR_URL}/${id}`);
    return response.data;
  },

  getCurrentYear: async () => {
    const response = await api.get(`${ACADEMIC_YEAR_URL}/current`);
    return response.data;
  },

  create: async (academicYearData) => {
    const response = await api.post(ACADEMIC_YEAR_URL, academicYearData);
    return response.data;
  },

  update: async (id, academicYearData) => {
    const response = await api.put(`${ACADEMIC_YEAR_URL}/${id}`, academicYearData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${ACADEMIC_YEAR_URL}/${id}`);
    return response.data;
  },

  setCurrent: async (id) => {
    const response = await api.put(`${ACADEMIC_YEAR_URL}/${id}/set-current`);
    return response.data;
  }
};

export default AcademicYearService;
