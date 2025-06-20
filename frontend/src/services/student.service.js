import api from './api';

const STUDENT_URL = '/students';

const StudentService = {
  getAll: async (page = 1, limit = 10, search = '', program_id = '', batch_id = '') => {
    let url = `${STUDENT_URL}?page=${page}&limit=${limit}&search=${search}`;
    if (program_id) {
      url += `&program_id=${program_id}`;
    }
    if (batch_id) {
      url += `&batch_id=${batch_id}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${STUDENT_URL}/${id}`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post(STUDENT_URL, studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`${STUDENT_URL}/${id}`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${STUDENT_URL}/${id}`);
    return response.data;
  },

  getByProgram: async (programId) => {
    const response = await api.get(`${STUDENT_URL}/program/${programId}`);
    return response.data;
  },

  getByParent: async (parentId) => {
    const response = await api.get(`${STUDENT_URL}/parent/${parentId}`);
    return response.data;
  }
};

export default StudentService;
