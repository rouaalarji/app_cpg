import api from './api';

async function getAll() {
  const response = await api.get('/jours-feries');
  return response.data;
}

async function getByMois(annee, mois) {
  const response = await api.get(`/jours-feries/mois/${annee}/${mois}`);
  return response.data;
}

async function getProchains() {
  const response = await api.get('/jours-feries/prochains');
  return response.data;
}

async function verifierDate(date) {
  const response = await api.get(`/jours-feries/verifier/${date}`);
  return response.data;
}

async function create(jour) {
  const response = await api.post('/jours-feries', jour);
  return response.data;
}

async function remove(id) {
  const response = await api.delete(`/jours-feries/${id}`);
  return response.data;
}

export { getAll, getByMois, getProchains, verifierDate, create, remove };