import api from './api';

async function getMesDemandes() {
  const response = await api.get('/demandes-conge/mes-demandes');
  return response.data;
}

async function getAll() {
  const response = await api.get('/demandes-conge');
  return response.data;
}

async function create(demande) {
  const response = await api.post('/demandes-conge', demande);
  return response.data;
}

async function annuler(id) {
  const response = await api.delete(`/demandes-conge/${id}/annuler`);
  return response.data;
}

async function validerParRh(id) {
  const response = await api.patch(`/demandes-conge/${id}/valider-rh`);
  return response.data;
}

async function refuser(id, commentaire) {
  const response = await api.patch(`/demandes-conge/${id}/refuser`, { commentaire });
  return response.data;
}

export { getMesDemandes, getAll, create, annuler, validerParRh, refuser };