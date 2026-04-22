import axios from 'axios';

const BASE_URL = 'https://qbdp-backend-production.up.railway.app/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('qbdp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  sessionStorage.setItem('qbdp_token', data.token);
  sessionStorage.setItem('qbdp_user', JSON.stringify(data.user));
  return data;
};

export const getEmployes = () => api.get('/employes').then(r => r.data);
export const getAccesEmploye = () => api.get('/employes/moi/acces-mobile').then(r => r.data);
export const getLogs     = () => api.get('/logs').then(r => r.data);
export const getStats    = () => api.get('/logs/stats').then(r => r.data);
export const getBatiments = () => api.get('/batiments').then(r => r.data);

export default api;
