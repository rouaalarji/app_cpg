import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function login(email, motDePasse) {
  const response = await axios.post(`${API_URL}/login`, { email, motDePasse });
  return response.data;
}

async function register(email, motDePasse, role) {
  const response = await axios.post(`${API_URL}/register`, { email, motDePasse, role });
  return response.data;
}

async function changerMotDePasse(ancienMotDePasse, nouveauMotDePasse) {
  const response = await api.post('/auth/changer-mot-de-passe', { ancienMotDePasse, nouveauMotDePasse });
  return response.data;
}

export { login, register, changerMotDePasse };