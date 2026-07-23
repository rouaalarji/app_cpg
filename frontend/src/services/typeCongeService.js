import api from './api';

async function getAll() {
  const response = await api.get('/types-conge');
  return response.data;
}

async function create(typeConge) {
  const response = await api.post('/types-conge', typeConge);
  return response.data;
}

async function update(id, typeConge) {
  const response = await api.put(`/types-conge/${id}`, typeConge);
  return response.data;
}

async function remove(id) {
  const response = await api.delete(`/types-conge/${id}`);
  return response.data;
}

export { getAll, create, update, remove };