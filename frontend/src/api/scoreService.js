import api from './axiosClient';

export async function analyzeContent(contentId) {
  const { data } = await api.post(`/content/${contentId}/analyze`);
  return data.data.score;
}

export async function improveContent(contentId) {
  const { data } = await api.post(`/content/${contentId}/improve`);
  return data.data;
}

export async function getScoreHistory(contentId) {
  const { data } = await api.get(`/content/${contentId}/scores`);
  return data.data.scores;
}

export async function getScoresOverview() {
  const { data } = await api.get('/scores/overview');
  return data.data;
}
