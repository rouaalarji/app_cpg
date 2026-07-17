import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function login(email, motDePasse) {
  const response = await axios.post(`${API_URL}/login`, { email, motDePasse });
  return response.data; // { token, utilisateur }
}

async function register(email, motDePasse, role) {
  const response = await axios.post(`${API_URL}/register`, { email, motDePasse, role });
  return response.data;
}

export { login, register };