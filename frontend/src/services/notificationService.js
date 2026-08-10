import api from './api';

async function getMesNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

async function marquerLue(id) {
  const response = await api.patch(`/notifications/${id}/lue`);
  return response.data;
}

async function marquerToutesLues() {
  const response = await api.patch('/notifications/toutes-lues');
  return response.data;
}

export { getMesNotifications, marquerLue, marquerToutesLues };