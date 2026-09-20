import { useState, useEffect } from 'react';
import { create } from '../../services/employeService';
import api from '../../services/api';

function AjouterEmployeModal({ onClose, onSuccess }) {
  const [departements, setDepartements] = useState([]);
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
    departementId: '',
    serviceId: '',
  });

  useEffect(() => {
    api.get('/departements').then((res) => setDepartements(res.data));
    api.get('/services').then((res) => setServices(res.data));
  }, []);

  // Fermer avec la touche Échap + bloquer le défilement de la page derrière
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !chargement) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [chargement, onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'departementId') {
      setFormData({ ...formData, departementId: value, serviceId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const servicesFiltres = services.filter(
    (s) => String(s.departement_id) === String(formData.departementId)
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await create(formData);
      onSuccess(`${formData.prenom} ${formData.nom}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la création';
      setErreur(message);
      setChargement(false);
    }
  }

  function handleBackdropMouseDown(e) {
    // Clic en dehors de la fenêtre = fermeture (sauf pendant l'envoi)
    if (e.target === e.currentTarget && !chargement) onClose();
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-ajouter-employe-titre"
        onMouseDown={handleBackdropMouseDown}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <form className="modal-content" onSubmit={handleSubmit} style={{ borderRadius: '12px' }}>
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="modal-ajouter-employe-titre">
                Ajouter un employé
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fermer"
                onClick={onClose}
                disabled={chargement}
              ></button>
            </div>

            <div className="modal-body">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">Compte de connexion</h6>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoFocus
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Mot de passe initial</label>
                  <input
                    type="text"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Rôle</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-select">
                  <option value="EMPLOYE">Employé</option>
                  <option value="CHEF">Chef</option>
                  <option value="RH">RH</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <hr />

              <h6 className="text-uppercase text-muted small fw-bold mb-3 mt-3">Informations employé</h6>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Nom</label>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Prénom</label>
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required className="form-control" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Date de naissance</label>
                  <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Date d'embauche</label>
                  <input type="date" name="dateEmbauche" value={formData.dateEmbauche} onChange={handleChange} required className="form-control" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Département</label>
                  <select
                    name="departementId"
                    value={formData.departementId}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">-- Sélectionner --</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Service</label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    required
                    disabled={!formData.departementId}
                    className="form-select"
                  >
                    <option value="">-- Sélectionner --</option>
                    {servicesFiltres.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>
                    ))}
                  </select>
                  {!formData.departementId && (
                    <small className="text-muted">Choisissez d'abord un département</small>
                  )}
                </div>
              </div>

              {erreur && <div className="alert alert-danger py-2 small mb-0">{erreur}</div>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={chargement}>
                Annuler
              </button>
              <button type="submit" disabled={chargement} className="btn btn-cpg-primary px-4">
                {chargement ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AjouterEmployeModal;