import api from './axiosClient';

export async function listCategories() {
  const { data } = await api.get('/categories');
  return data.data.categories;
}

export async function getCategory(id) {
  const { data } = await api.get(`/categories/${id}`);
  return data.data.category;
}

export async function createCategory(payload) {
  const { data } = await api.post('/categories', payload);
  return data.data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data.category;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
}
