import api from './axios.instance';

export const usersApi = {
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updateProfile: (data) => api.patch('/users/profile', data).then((r) => r.data),
  getUser: (id) => api.get(`/users/${id}`).then((r) => r.data),
  getLeaderboard: (limit = 10) => api.get('/users/leaderboard', { params: { limit } }).then((r) => r.data),
  uploadAvatar: (formData) =>
    api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getNotifications: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markNotificationsRead: (ids) => api.patch('/notifications/mark-read', { ids }).then((r) => r.data),
};
