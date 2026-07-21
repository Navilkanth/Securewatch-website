import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const logsApi = {
  getAll: (params) => api.get('/logs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/logs/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/logs/${id}`, data).then((r) => r.data),
  upload: (records, filename, fileType) =>
    api.post('/logs/upload', { records, filename, fileType }).then((r) => r.data),
  getFilters: () => api.get('/logs/filters').then((r) => r.data),
  getUploadHistory: () => api.get('/logs/uploads/history').then((r) => r.data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard').then((r) => r.data),
};

export const analyticsApi = {
  getAnalytics: () => api.get('/analytics').then((r) => r.data),
};

export const alertsApi = {
  getAll: (params) => api.get('/alerts', { params }).then((r) => r.data),
  dismiss: (id) => api.put(`/alerts/${id}/dismiss`).then((r) => r.data),
};

export default api;
