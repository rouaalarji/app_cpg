import api from './api';

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

export { getAll, getById, create, update, remove };