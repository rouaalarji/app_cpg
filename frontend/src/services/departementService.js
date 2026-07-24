import api from './api';

async function getAll() {
  const response = await api.get('/departements');
  return response.data;
}

async function create(departement) {
  const response = await api.post('/departements', departement);
  return response.data;
}

async function update(id, departement) {
  const response = await api.put(`/departements/${id}`, departement);
  return response.data;
}

async function remove(id) {
  const response = await api.delete(`/departements/${id}`);
  return response.data;
}

export { getAll, create, update, remove };