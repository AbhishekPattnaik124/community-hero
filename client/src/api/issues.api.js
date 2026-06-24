import api from './axios.instance';

export const issuesApi = {
  getAll: (params) => api.get('/issues', { params }).then((r) => r.data),
  getById: (id) => api.get(`/issues/${id}`).then((r) => r.data),
  create: (data) => api.post('/issues', data).then((r) => r.data),
  update: (id, data) => api.patch(`/issues/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/issues/${id}`).then((r) => r.data),
  toggleUpvote: (id) => api.post(`/issues/${id}/upvote`).then((r) => r.data),
  getComments: (id, params) => api.get(`/issues/${id}/comments`, { params }).then((r) => r.data),
  addComment: (id, data) => api.post(`/issues/${id}/comments`, data).then((r) => r.data),
  getAnalytics: (params) => api.get('/issues/analytics', { params }).then((r) => r.data),
  uploadImages: (formData) =>
    api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
};
