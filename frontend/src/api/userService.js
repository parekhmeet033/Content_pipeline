import api from './axiosClient';

export async function updateProfile(payload) {
  const { data } = await api.put('/users/me', payload);
  return data.data;
}

export async function changePassword(payload) {
  const { data } = await api.put('/users/me/password', payload);
  return data.data;
}

export async function deleteAccount() {
  const { data } = await api.delete('/users/me');
  return data.data;
}
