import api from './api';

async function getStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}

export { getStats };