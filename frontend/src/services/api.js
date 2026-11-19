import axios from 'axios';
// fichier service pour gérer les requêtes API vers le backend. Il utilise axios pour effectuer des requêtes HTTP et configure l'URL de base de l'API ainsi que les en-têtes par défaut. Il inclut également un intercepteur de requête pour ajouter le token d'authentification aux en-têtes si celui-ci est présent dans le stockage local.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});
// Intercepteur de requête pour ajouter le token d'authentification 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;