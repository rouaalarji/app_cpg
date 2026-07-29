import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAll, create, update, remove } from '../../services/typeCongeService';
import Modal from '../../components/Modal';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function TypesConge() {
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.role === 'ADMIN';

  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [messageSucces, setMessageSucces] = useState('');

  const [afficherForm, setAfficherForm] = useState(false);
  const [idEnEdition, setIdEnEdition] = useState(null);
  const [erreurForm, setErreurForm] = useState('');
  const [illimite, setIllimite] = useState(false);

  const [formData, setFormData] = useState({
    code: '', nom: '', description: '', nbJoursParAn: '', necessiteJustificatif: false,
  });

  async function charger() {
    try {
      const data = await getAll();
      setTypes(data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function ouvrirAjout() {
    setIdEnEdition(null);
    setFormData({ code: '', nom: '', description: '', nbJoursParAn: '', necessiteJustificatif: false });
    setIllimite(false);
    setErreurForm('');
    setAfficherForm(true);
  }

  function ouvrirEdition(type) {
    setIdEnEdition(type.id);
    setFormData({
      code: type.code || '',
      nom: type.nom,
      description: type.description || '',
      nbJoursParAn: type.nb_jours_par_an ?? '',
      necessiteJustificatif: !!type.necessite_justificatif,
    });
    setIllimite(type.nb_jours_par_an === null);
    setErreurForm('');
    setAfficherForm(true);
  }

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreurForm('');
    try {
      const payload = {
        ...formData,
        nbJoursParAn: illimite ? null : parseInt(formData.nbJoursParAn, 10),
      };
      if (idEnEdition) {
        await update(idEnEdition, payload);
        setMessageSucces('Type de congé modifié avec succès.');
      } else {
        await create(payload);
        setMessageSucces('Type de congé créé avec succès.');
      }
      setAfficherForm(false);
      charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      setErreurForm(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleSupprimer(id, nom) {
    if (!window.confirm(`Supprimer le type "${nom}" ?`)) return;
    try {
      await remove(id);
      setMessageSucces('Type de congé supprimé.');
      charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Types de congés</h2>
          <p className="text-muted mb-0">{types.length} type(s) configuré(s)</p>
        </div>
        {estAdmin && (
          <button onClick={ouvrirAjout} className="btn btn-cpg-primary d-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Ajouter
          </button>
        )}
      </div>

      {messageSucces && (
        <div className="alert d-flex align-items-center gap-2 mb-3" style={{ background: 'var(--cpg-success-light)', color: '#047857', border: 'none', borderRadius: '10px' }}>
          <i className="bi bi-check-circle-fill"></i> {messageSucces}
        </div>
      )}

      {afficherForm && (
        <Modal titre={idEnEdition ? 'Modifier le type de congé' : 'Ajouter un type de congé'} onFermer={() => setAfficherForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="ex: C1"
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Nom du type</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="ex: Congé annuel"
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
                placeholder="ex: Congé accordé annuellement à chaque employé."
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Nombre de jours autorisés</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  name="nbJoursParAn"
                  value={formData.nbJoursParAn}
                  onChange={handleChange}
                  disabled={illimite}
                  required={!illimite}
                  className="form-control"
                  placeholder="ex: 30"
                />
                <div className="form-check text-nowrap">
                  <input
                    type="checkbox"
                    checked={illimite}
                    onChange={(e) => setIllimite(e.target.checked)}
                    className="form-check-input"
                    id="illimiteCheck"
                  />
                  <label className="form-check-label small" htmlFor="illimiteCheck">Illimité</label>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold d-block">Justificatif obligatoire</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    type="radio"
                    name="necessiteJustificatif"
                    checked={formData.necessiteJustificatif === true}
                    onChange={() => setFormData({ ...formData, necessiteJustificatif: true })}
                    className="form-check-input"
                    id="justifOui"
                  />
                  <label className="form-check-label small" htmlFor="justifOui">Oui</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    name="necessiteJustificatif"
                    checked={formData.necessiteJustificatif === false}
                    onChange={() => setFormData({ ...formData, necessiteJustificatif: false })}
                    className="form-check-input"
                    id="justifNon"
                  />
                  <label className="form-check-label small" htmlFor="justifNon">Non</label>
                </div>
              </div>
            </div>

            {erreurForm && <div className="alert alert-danger py-2 small">{erreurForm}</div>}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-cpg-primary">Enregistrer</button>
              <button type="button" onClick={() => setAfficherForm(false)} className="btn btn-outline-secondary">Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && types.length === 0 && (
          <div className="p-5 text-center text-muted">Aucun type de congé configuré.</div>
        )}

        {!chargement && types.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Jours autorisés</th>
                <th>Justificatif</th>
                {estAdmin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td className="text-muted">{t.code}</td>
                  <td className="fw-semibold">{t.nom}</td>
                  <td>
                    {t.nb_jours_par_an === null ? (
                      <span className="badge badge-cpg-neutral">Illimité</span>
                    ) : (
                      `${t.nb_jours_par_an} jours`
                    )}
                  </td>
                  <td>
                    <span className={`badge ${t.necessite_justificatif ? 'badge-cpg-warning' : 'badge-cpg-neutral'}`}>
                      {t.necessite_justificatif ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  {estAdmin && (
                    <td className="text-end">
                      <button onClick={() => ouvrirEdition(t)} className="btn btn-sm btn-light me-1"><i className="bi bi-pencil"></i></button>
                      <button onClick={() => handleSupprimer(t.id, t.nom)} className="btn btn-sm btn-light text-danger"><i className="bi bi-trash"></i></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default TypesConge;