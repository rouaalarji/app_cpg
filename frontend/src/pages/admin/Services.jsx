import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Modal from '../../components/Modal';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
const NOUVEAU = '__nouveau__';

function Services() {
  const [services, setServices] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [erreurForm, setErreurForm] = useState('');
  const [afficherForm, setAfficherForm] = useState(false);

  const [formData, setFormData] = useState({
    code: '', nom: '', departementId: '', nouveauDepartementNom: '', chefId: '',
  });

  async function charger() {
    try {
      const [servicesRes, departementsRes, chefsRes] = await Promise.all([
        api.get('/services'),
        api.get('/departements'),
        api.get('/employes/chefs'),
      ]);
      setServices(servicesRes.data);
      setDepartements(departementsRes.data);
      setChefs(chefsRes.data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function ouvrirAjout() {
    setFormData({ code: '', nom: '', departementId: '', nouveauDepartementNom: '', chefId: '' });
    setErreurForm('');
    setAfficherForm(true);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreurForm('');
    try {
      let departementId = formData.departementId;

      if (departementId === NOUVEAU) {
        if (!formData.nouveauDepartementNom.trim()) {
          setErreurForm('Le nom du nouveau département est requis');
          return;
        }
        const resDep = await api.post('/departements', { nom: formData.nouveauDepartementNom });
        departementId = resDep.data.id;
      }

      await api.post('/services', {
        code: formData.code,
        nom: formData.nom,
        departementId,
        chefId: formData.chefId || null,
      });
      setMessageSucces('Service créé avec succès.');
      setAfficherForm(false);
      await charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      setErreurForm(err.response?.data?.message || 'Erreur lors de la création');
    }
  }

  const filtres = services.filter((s) =>
    `${s.code} ${s.nom} ${s.departement_nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Services</h2>
          <p className="text-muted mb-0">{services.length} service(s)</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/departements" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-diagram-3"></i> Gérer les départements
          </Link>
          <button onClick={ouvrirAjout} className="btn btn-cpg-primary d-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Ajouter un service
          </button>
        </div>
      </div>

      {messageSucces && (
        <div className="alert d-flex align-items-center gap-2 mb-3" style={{ background: 'var(--cpg-success-light)', color: '#047857', border: 'none', borderRadius: '10px' }}>
          <i className="bi bi-check-circle-fill"></i> {messageSucces}
        </div>
      )}

      {afficherForm && (
        <Modal titre="Nouveau service" onFermer={() => setAfficherForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required className="form-control" placeholder="ex: 100, 110" />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nom du service</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className="form-control" placeholder="ex: Extraction, Laverie Nord" />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Département</label>
              <select name="departementId" value={formData.departementId} onChange={handleChange} required className="form-select">
                <option value="">-- Sélectionner --</option>
                {departements.map((d) => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
                <option value={NOUVEAU}>+ Nouveau département</option>
              </select>
            </div>
            {formData.departementId === NOUVEAU && (
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nom du nouveau département</label>
                <input
                  type="text"
                  name="nouveauDepartementNom"
                  value={formData.nouveauDepartementNom}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Chef de service (optionnel)</label>
              <select name="chefId" value={formData.chefId} onChange={handleChange} className="form-select">
                <option value="">-- Aucun --</option>
                {chefs.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom} ({c.matricule})</option>
                ))}
              </select>
            </div>
            {erreurForm && <div className="alert alert-danger py-2 small">{erreurForm}</div>}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-cpg-primary">Créer</button>
              <button type="button" onClick={() => setAfficherForm(false)} className="btn btn-outline-secondary">Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Rechercher un service..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && filtres.length === 0 && <div className="p-5 text-center text-muted">Aucun service trouvé.</div>}

        {!chargement && filtres.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service</th>
                <th>Département</th>
                <th>Lieu</th>
                <th>Chef</th>
                <th>Effectif</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((s) => (
                <tr key={s.id}>
                  <td className="text-muted">{s.code}</td>
                  <td className="fw-semibold">{s.nom}</td>
                  <td><span className="badge badge-cpg-neutral">{s.departement_nom}</span></td>
                  <td className="text-muted">{s.departement_lieu || '—'}</td>
                  <td>{s.chef_nom || <span className="text-muted">Non défini</span>}</td>
                  <td><span className="badge badge-cpg-success">{s.nb_employes} employé{s.nb_employes > 1 ? 's' : ''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default Services;