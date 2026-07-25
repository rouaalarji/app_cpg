import api from './api';

async function getMesAbsences() {
  const response = await api.get('/absences/mes-absences');
  return response.data;
}

async function create(absence) {
  const response = await api.post('/absences', absence);
  return response.data;
}

async function getAllAdmin() {
  const response = await api.get('/absences/admin');
  return response.data;
}

async function getStats() {
  const response = await api.get('/absences/stats');
  return response.data;
}

async function update(id, absence) {
  const response = await api.put(`/absences/${id}`, absence);
  return response.data;
}

export { getMesAbsences, create, getAllAdmin, getStats, update };