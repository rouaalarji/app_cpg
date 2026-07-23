import { useState, useEffect } from 'react';
import { getAll, create, remove } from '../../services/typeCongeService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function TypesConge() {
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    nbJoursParAn: '21',
    necessiteJustificatif: false,
  });
  const [afficherForm, setAfficherForm] = useState(false);

  async function charger() {
    try {
      const data = await getAll();
      setTypes(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await create({
        nom: formData.nom,
        nbJoursParAn: parseInt(formData.nbJoursParAn, 10),
        necessiteJustificatif: formData.necessiteJustificatif,
      });
      setFormData({ nom: '', nbJoursParAn: '21', necessiteJustificatif: false });
      setAfficherForm(false);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
    }
  }

  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer ce type de congé ?')) return;
    try {
      await remove(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Types de congés</h2>
        <button className="btn btn-cpg-primary" onClick={() => setAfficherForm(!afficherForm)}>
          <i className="bi bi-plus-lg me-1"></i> {afficherForm ? 'Annuler' : 'Nouveau type'}
        </button>
      </div>

      {afficherForm && (
        <div className="card card-cpg p-4 mb-4" style={{ maxWidth: '450px' }}>
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
                placeholder="ex: Congé annuel, Congé maladie"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Jours par an</label>
              <input
                type="number"
                name="nbJoursParAn"
                value={formData.nbJoursParAn}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                name="necessiteJustificatif"
                checked={formData.necessiteJustificatif}
                onChange={handleChange}
                className="form-check-input"
                id="justificatifCheck"
              />
              <label className="form-check-label small" htmlFor="justificatifCheck">
                Nécessite un justificatif
              </label>
            </div>
            <button type="submit" className="btn btn-cpg-primary w-100">Créer</button>
          </form>
        </div>
      )}

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && types.length === 0 && (
        <p className="text-muted">Aucun type de congé configuré.</p>
      )}

      {!chargement && types.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Jours / an</th>
                <th>Justificatif requis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td>{t.nom}</td>
                  <td>{t.nb_jours_par_an}</td>
                  <td>
                    <span className={`badge ${t.necessite_justificatif ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {t.necessite_justificatif ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleSupprimer(t.id)} className="btn btn-sm btn-outline-danger">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutAdmin>
  );
}

export default TypesConge;