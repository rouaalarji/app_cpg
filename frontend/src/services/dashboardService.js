import api from './api';

async function getStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}
async function getStatsChef() {
  const response = await api.get('/dashboard/stats-chef');
  return response.data;
}
export { getStats, getStatsChef };