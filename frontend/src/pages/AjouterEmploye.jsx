import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from '../services/employeService';
import api from '../services/api';
import Layout from '../components/Layout';

function AjouterEmploye() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    role: 'EMPLOYE',
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    dateEmbauche: '',
    poste: '',
    serviceId: '',
  });

  useEffect(() => {
    async function chargerServices() {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (err) {
        console.error('Erreur chargement services', err);
      }
    }
    chargerServices();
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await create(formData);
      navigate('/employes');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la création';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <Layout>
      <h2>Ajouter un employé</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <h4 style={{ marginBottom: '8px' }}>Compte de connexion</h4>

        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Mot de passe initial</label>
          <input
            type="text"
            name="motDePasse"
            value={formData.motDePasse}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Rôle</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="EMPLOYE">Employé</option>
            <option value="CHEF">Chef</option>
            <option value="RH">RH</option>
          </select>
        </div>

        <h4 style={{ marginBottom: '8px' }}>Informations employé</h4>

        <div style={{ marginBottom: '12px' }}>
          <label>Matricule</label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Date de naissance</label>
          <input
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Date d'embauche</label>
          <input
            type="date"
            name="dateEmbauche"
            value={formData.dateEmbauche}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Poste</label>
          <input
            type="text"
            name="poste"
            value={formData.poste}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Service</label>
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Sélectionner --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.nom}
              </option>
            ))}
          </select>
        </div>

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

        <button type="submit" disabled={chargement} style={{ padding: '10px 20px' }}>
          {chargement ? 'Création...' : 'Créer'}
        </button>
      </form>
    </Layout>
  );
}

export default AjouterEmploye;