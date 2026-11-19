import api from './api';
// cette fichier est pour gérer les requêtes API liées aux employés
// getAll : récupérer tous les employés
async function getAll() {
  const response = await api.get('/employes');
  return response.data;
}

async function getById(id) {
  const response = await api.get(`/employes/${id}`);
  return response.data;
}

async function create(employe) {
  const response = await api.post('/employes', employe);
  return response.data;
}

async function update(id, employe) {
  const response = await api.put(`/employes/${id}`, employe);
  return response.data;
}

async function remove(id) {
  const response = await api.delete(`/employes/${id}`);
  return response.data;
}
async function getMonEquipe(date) {
  const response = await api.get('/employes/mon-equipe', { params: { date } });
  return response.data;
}
async function getMonProfil() {
  const response = await api.get('/employes/mon-profil');
  return response.data;
}
async function getByService(serviceId) {
  const response = await api.get(`/employes/service/${serviceId}`);
  return response.data;
}

async function getByDepartement(departementId) {
  const response = await api.get(`/employes/departement/${departementId}`);
  return response.data;
}
//en faire exportation pour pouvoir l'utiliser dans d'autres fichiers
export { getAll, getById, create, update, remove,getMonEquipe,getMonProfil,getByService,getByDepartement };