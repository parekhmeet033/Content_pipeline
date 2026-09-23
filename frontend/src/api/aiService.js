import api from './axiosClient';

export async function generateContent(payload) {
  const { data } = await api.post('/ai/generate', payload);
  return data.data.result;
}

export async function getSuggestions(payload) {
  const { data } = await api.post('/ai/suggestions', payload);
  return data.data.result;
}
