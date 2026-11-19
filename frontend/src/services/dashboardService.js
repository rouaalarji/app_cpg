import api from './api';
//Le service est le seul endroit du frontend qui parle au backend. Chaque fonction correspond à une route de l’API
async function getStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}
async function getStatsChef() {
  const response = await api.get('/dashboard/stats-chef');
  return response.data;
}
async function getDemandesConge() {
  const response = await api.get('/dashboard/demandes-conge-equipe');
  return response.data;
}
export { getStats, getStatsChef, getDemandesConge };