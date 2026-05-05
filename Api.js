// src/utils/Api.js
import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const api = {
  health: () => axios.get(`${BASE}/health`),
  analytics: () => axios.get(`${BASE}/analytics`),
  tickets: (params) => axios.get(`${BASE}/tickets`, { params }),
  predict: (body) => axios.post(`${BASE}/predict`, body),
  reset: () => axios.post(`${BASE}/reset`),
};

export default api;