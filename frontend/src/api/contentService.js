import api from './axiosClient';

export async function listContent(params = {}) {
  const { data } = await api.get('/content', { params });
  return data.data;
}

export async function getContent(id) {
  const { data } = await api.get(`/content/${id}`);
  return data.data.content;
}

export async function createContent(payload) {
  const { data } = await api.post('/content', payload);
  return data.data.content;
}

export async function updateContent(id, payload) {
  const { data } = await api.put(`/content/${id}`, payload);
  return data.data.content;
}

export async function deleteContent(id) {
  const { data } = await api.delete(`/content/${id}`);
  return data.data;
}

export async function updateStatus(id, status) {
  const { data } = await api.patch(`/content/${id}/status`, { status });
  return data.data.content;
}

export async function scheduleContent(id, scheduledAt) {
  const { data } = await api.patch(`/content/${id}/schedule`, { scheduledAt });
  return data.data.content;
}

export async function listVersions(id) {
  const { data } = await api.get(`/content/${id}/versions`);
  return data.data.versions;
}

export async function getVersion(id, versionId) {
  const { data } = await api.get(`/content/${id}/versions/${versionId}`);
  return data.data.version;
}

export async function restoreVersion(id, versionId) {
  const { data } = await api.post(`/content/${id}/versions/${versionId}/restore`);
  return data.data.content;
}
