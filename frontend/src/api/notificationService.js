import api from './axiosClient';

export async function listNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params });
  return data.data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count');
  return data.data.count;
}

export async function markRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data.notification;
}

export async function markAllRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data.data;
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`);
  return data.data;
}
