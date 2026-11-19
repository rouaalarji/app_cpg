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
async function getHistoriqueMensuel() {
  const res = await api.get('/absences/historique-mensuel');
  return res.data;
}

async function getByMois(mois) {
  const res = await api.get(`/absences/mois/${mois}`);
  return res.data;
}
// content type multipart/form-data est utilisé pour envoyer des fichiers binaires (comme des images ou des documents) ainsi que des données de formulaire. Cela permet d'envoyer à la fois le motif de l'absence et un fichier justificatif en une seule requête HTTP.
async function declarerSurExistante(id, donnees) {
  const response = await api.put(`/absences/${id}/declarer`, donnees, {
    // multipart/form-data est utilisé pour envoyer des fichiers binaires (comme des images ou des documents) 
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
export { getMesAbsences, create, getAllAdmin, getStats, update, getHistoriqueMensuel, getByMois, declarerSurExistante };