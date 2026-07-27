import api from './api';

async function getByEmploye(employeId) {
  const response = await api.get(`/presences/employe/${employeId}`);
  return response.data;
}

async function marquerPresence(presence) {
  const response = await api.post('/presences', presence);
  return response.data;
}

async function getMesPresences() {
  const response = await api.get('/presences/mes-presences');
  return response.data;
}

async function checkIn() {
  const response = await api.post('/presences/check-in');
  return response.data;
}

async function checkOut() {
  const response = await api.post('/presences/check-out');
  return response.data;
}

export { getByEmploye, marquerPresence, getMesPresences, checkIn, checkOut };