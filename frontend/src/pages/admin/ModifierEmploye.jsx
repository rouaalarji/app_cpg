import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getById, update } from '../../services/employeService';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
function ModifierEmploye() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [chargementInitial, setChargementInitial] = useState(true);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    poste: '',
    serviceId: '',
    statut: 'ACTIF',
  });

  useEffect(() => {
    async function charger() {
      try {
        const [employe, servicesResponse] = await Promise.all([
          getById(id),
          api.get('/services'),
        ]);
        setServices(servicesResponse.data);
        setFormData({
          nom: employe.nom,
          prenom: employe.prenom,
          dateNaissance: employe.date_naissance ? employe.date_naissance.split('T')[0] : '',
          poste: employe.poste,
          serviceId: employe.service_id,
          statut: employe.statut,
        });
      } catch (err) {
        setErreur('Impossible de charger cet employé');
      } finally {
        setChargementInitial(false);
      }
    }
    charger();
  }, [id]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await update(id, formData);
      navigate('/employes');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la modification';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  if (chargementInitial) {
    return (
      <LayoutAdmin>
        <p>Chargement...</p>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <h2>Modifier un employé</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
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
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.nom}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Statut</label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

        <button type="submit" disabled={chargement} style={{ padding: '10px 20px' }}>
          {chargement ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </LayoutAdmin>
  );
}

export default ModifierEmploye;