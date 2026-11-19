import api from './api';

export async function getRapportMensuel(mois) {
  const { data } = await api.get('/rapports/mensuel', { params: { mois } });
  return data;
}