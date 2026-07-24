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
    zoneTravail: 'ADMINISTRATIF',
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
          zoneTravail: employe.zone_travail,
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
      navigate('/admin/employes');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la modification';
      setErreur(message);
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
      <h2 className="fw-bold mb-3">Modifier un employé</h2>

      <div className="card card-cpg p-4" style={{ maxWidth: '550px' }}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Date de naissance</label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Poste</label>
            <input
              type="text"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Zone de travail</label>
            <select name="zoneTravail" value={formData.zoneTravail} onChange={handleChange} className="form-select">
              <option value="ADMINISTRATIF">Administratif</option>
              <option value="TERRAIN">Terrain</option>
              <option value="ATELIER">Atelier</option>
              <option value="MAGASIN">Magasin</option>
              <option value="LABORATOIRE">Laboratoire</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Service</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="form-select"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="form-select"
            >
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
          </div>

          {erreur && <div className="alert alert-danger py-2 small">{erreur}</div>}

          <div className="d-flex gap-2">
            <button type="submit" disabled={chargement} className="btn btn-cpg-primary px-4">
              {chargement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => navigate('/admin/employes')} className="btn btn-outline-secondary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </LayoutAdmin>
  );
}

export default ModifierEmploye;