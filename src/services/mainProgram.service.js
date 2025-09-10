import api from './api';

const MAIN_PROGRAM_URL = '/main-programs';

const MainProgramService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`${MAIN_PROGRAM_URL}?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${MAIN_PROGRAM_URL}/${id}`);
    return response.data;
  },

  create: async (programData) => {
    const response = await api.post(MAIN_PROGRAM_URL, programData);
    return response.data;
  },

  update: async (id, programData) => {
    const response = await api.put(`${MAIN_PROGRAM_URL}/${id}`, programData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${MAIN_PROGRAM_URL}/${id}`);
    return response.data;
  },

  getProgramsByMainProgram: async (mainProgramId) => {
    const response = await api.get(`${MAIN_PROGRAM_URL}/${mainProgramId}/programs`);
    return response.data;
  }
};

export default MainProgramService;
