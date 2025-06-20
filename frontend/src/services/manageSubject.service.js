import api from './api';

const MANAGE_SUBJECT_URL = '/manage-subjects';

const ManageSubjectService = {
  getAll: async (page = 1, limit = 10, search = '', academicYearId = '', majorId = '') => {
    let url = `${MANAGE_SUBJECT_URL}?page=${page}&limit=${limit}&search=${search}`;
    if (academicYearId) {
      url += `&academicYearId=${academicYearId}`;
    }
    if (majorId) {
      url += `&majorId=${majorId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${MANAGE_SUBJECT_URL}/${id}`);
    return response.data;
  },

  create: async (manageSubjectData) => {
    const response = await api.post(MANAGE_SUBJECT_URL, manageSubjectData);
    return response.data;
  },

  update: async (id, manageSubjectData) => {
    const response = await api.put(`${MANAGE_SUBJECT_URL}/${id}`, manageSubjectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${MANAGE_SUBJECT_URL}/${id}`);
    return response.data;
  },

  getByMajor: async (majorId, academicYearId) => {
    let url = `${MANAGE_SUBJECT_URL}/major/${majorId}`;
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getByTeacher: async (teacherId, academicYearId) => {
    let url = `${MANAGE_SUBJECT_URL}/teacher/${teacherId}`;
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    const response = await api.get(url);
    return response.data;
  }
};

export default ManageSubjectService;
