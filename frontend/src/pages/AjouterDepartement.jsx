import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

function AjouterDepartement() {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    try {
      await api.post('/departements', { nom });
      navigate('/services');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  }

  return (
    <Layout>
      <h2>Ajouter un département</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label>Nom (ex: Administratif, Terrain)</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>Créer</button>
      </form>
    </Layout>
  );
}

export default AjouterDepartement;