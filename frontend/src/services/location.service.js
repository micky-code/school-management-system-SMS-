import api from './api';

const LocationService = {
  // Provinces
  getProvinces: async () => {
    const response = await api.get('/provinces');
    return response.data;
  },

  getProvinceById: async (id) => {
    const response = await api.get(`/provinces/${id}`);
    return response.data;
  },

  // Districts
  getDistricts: async () => {
    const response = await api.get('/districts');
    return response.data;
  },

  getDistrictsByProvince: async (provinceId) => {
    const response = await api.get(`/districts/province/${provinceId}`);
    return response.data;
  },

  // Communes
  getCommunes: async () => {
    const response = await api.get('/communes');
    return response.data;
  },

  getCommunesByDistrict: async (districtId) => {
    const response = await api.get(`/communes/district/${districtId}`);
    return response.data;
  },

  // Villages
  getVillages: async () => {
    const response = await api.get('/villages');
    return response.data;
  },

  getVillagesByCommune: async (communeId) => {
    const response = await api.get(`/villages/commune/${communeId}`);
    return response.data;
  }
};

export default LocationService;
