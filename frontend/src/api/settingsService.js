import api from './axiosClient';

export async function getSettings() {
  const { data } = await api.get('/settings');
  return data.data.settings;
}

export async function updateSettings(payload) {
  const { data } = await api.put('/settings', payload);
  return data.data.settings;
}
