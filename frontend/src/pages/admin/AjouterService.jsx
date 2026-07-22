import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
function AjouterService() {
  const navigate = useNavigate();
  const [departements, setDepartements] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    departementId: '',
    nouveauDepartementNom: '',
  });

  const NOUVEAU = '__nouveau__';

  useEffect(() => {
    api.get('/departements').then((res) => setDepartements(res.data));
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      let departementId = formData.departementId;

      // Si l'utilisateur a choisi de créer un nouveau département
      if (departementId === NOUVEAU) {
        if (!formData.nouveauDepartementNom.trim()) {
          setErreur('Le nom du nouveau département est requis');
          setChargement(false);
          return;
        }
        const resDep = await api.post('/departements', { nom: formData.nouveauDepartementNom });
        departementId = resDep.data.id;
      }

      await api.post('/services', {
        code: formData.code,
        nom: formData.nom,
        departementId,
      });

      navigate('/services');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setChargement(false);
    }
  }

  return (
    <LayoutAdmin>
      <h2>Ajouter un service</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label>Code (ex: 100, 110)</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Nom du service (ex: RH, Laverie Nord, Carrière Redeyef)</label>
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
          <label>Département</label>
          <select
            name="departementId"
            value={formData.departementId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Sélectionner --</option>
            {departements.map((d) => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
            <option value={NOUVEAU}>+ Nouveau département</option>
          </select>
        </div>

        {formData.departementId === NOUVEAU && (
          <div style={{ marginBottom: '12px' }}>
            <label>Nom du nouveau département (ex: Administratif, Terrain)</label>
            <input
              type="text"
              name="nouveauDepartementNom"
              value={formData.nouveauDepartementNom}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        )}

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

        <button type="submit" disabled={chargement} style={{ padding: '10px 20px' }}>
          {chargement ? 'Création...' : 'Créer'}
        </button>
      </form>
    </LayoutAdmin>
  );
}

export default AjouterService;