import api from './api';

async function getByEmploye(employeId) {
  const response = await api.get(`/presences/employe/${employeId}`);
  return response.data;
}

async function marquerPresence(presence) {
  const response = await api.post('/presences', presence);
  return response.data;
}

export { getByEmploye, marquerPresence };