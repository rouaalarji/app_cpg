import { useState, useEffect } from 'react';
import { getAll, create, update, remove } from '../../services/departementService';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function Departements() {
  const [departements, setDepartements] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [messageSucces, setMessageSucces] = useState('');
  const [recherche, setRecherche] = useState('');

  const [afficherForm, setAfficherForm] = useState(false);
  const [idEnEdition, setIdEnEdition] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '', responsableId: '', statut: 'ACTIF' });

  async function charger() {
    try {
      const [depRes, empRes] = await Promise.all([getAll(), api.get('/employes')]);
      setDepartements(depRes);
      setEmployes(empRes.data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function ouvrirAjout() {
    setIdEnEdition(null);
    setFormData({ nom: '', description: '', responsableId: '', statut: 'ACTIF' });
    setAfficherForm(true);
  }

  function ouvrirEdition(dep) {
    setIdEnEdition(dep.id);
    setFormData({
      nom: dep.nom,
      description: dep.description || '',
      responsableId: dep.responsable_id || '',
      statut: dep.statut,
    });
    setAfficherForm(true);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (idEnEdition) {
        await update(idEnEdition, formData);
        setMessageSucces('Département modifié avec succès.');
      } else {
        await create(formData);
        setMessageSucces('Département créé avec succès.');
      }
      setAfficherForm(false);
      charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleSupprimer(id, nom) {
    if (!window.confirm(`Supprimer le département "${nom}" ?`)) return;
    try {
      await remove(id);
      setMessageSucces('Département supprimé.');
      charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  const filtres = departements.filter((d) => d.nom.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Départements</h2>
          <p className="text-muted mb-0">{departements.length} département(s)</p>
        </div>
        <button onClick={ouvrirAjout} className="btn btn-cpg-primary d-flex align-items-center gap-1">
          <i className="bi bi-plus-lg"></i> Ajouter un département
        </button>
      </div>

      {messageSucces && (
        <div className="alert d-flex align-items-center gap-2 mb-3" style={{ background: 'var(--cpg-success-light)', color: '#047857', border: 'none', borderRadius: '10px' }}>
          <i className="bi bi-check-circle-fill"></i> {messageSucces}
        </div>
      )}

      {afficherForm && (
        <div className="card-cpg p-4 mb-4" style={{ maxWidth: '480px' }}>
          <h6 className="fw-bold mb-3">{idEnEdition ? 'Modifier le département' : 'Nouveau département'}</h6>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="ex: Production, Maintenance, RH"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Responsable</label>
              <select name="responsableId" value={formData.responsableId} onChange={handleChange} className="form-select">
                <option value="">-- Aucun --</option>
                {employes.map((e) => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange} className="form-select">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-cpg-primary">{idEnEdition ? 'Enregistrer' : 'Créer'}</button>
              <button type="button" onClick={() => setAfficherForm(false)} className="btn btn-outline-secondary">Annuler</button>
            </div>
          </form>
        </div>
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
              placeholder="Rechercher un département..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && filtres.length === 0 && <div className="p-5 text-center text-muted">Aucun département trouvé.</div>}

        {!chargement && filtres.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Département</th>
                <th>Responsable</th>
                <th>Services</th>
                <th>Employés</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.nom}</td>
                  <td>{d.responsable_nom || <span className="text-muted">Non défini</span>}</td>
                  <td><span className="badge badge-cpg-neutral">{d.nb_services}</span></td>
                  <td><span className="badge badge-cpg-success">{d.nb_employes}</span></td>
                  <td>
                    <span className={`badge ${d.statut === 'ACTIF' ? 'badge-cpg-success' : 'badge-cpg-neutral'}`}>
                      {d.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button onClick={() => ouvrirEdition(d)} className="btn btn-sm btn-light me-1"><i className="bi bi-pencil"></i></button>
                    <button onClick={() => handleSupprimer(d.id, d.nom)} className="btn btn-sm btn-light text-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default Departements;