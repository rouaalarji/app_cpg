import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonProfil } from '../../services/employeService';
import api from '../../services/api';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

const NOUVEAU = '__nouveau__';

function calculerNbJours(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return 0;
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diff = Math.floor((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

function DemanderConge() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [typesConge, setTypesConge] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [fichier, setFichier] = useState(null);

  const [formData, setFormData] = useState({
    typeCongeId: '',
    nouveauTypeNom: '',
    nouveauTypeJours: '21',
    dateDebut: '',
    dateFin: '',
    motif: '',
    adresseConge: '',
    telephoneConge: '',
  });

  useEffect(() => {
    async function charger() {
      try {
        const [profilData, typesRes] = await Promise.all([
          getMonProfil(),
          api.get('/types-conge'),
        ]);
        setProfil(profilData);
        setTypesConge(typesRes.data);
      } catch (err) {
        setErreur('Impossible de charger votre profil');
      }
    }
    charger();
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const nbJours = calculerNbJours(formData.dateDebut, formData.dateFin);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      let typeCongeId = formData.typeCongeId;

      if (typeCongeId === NOUVEAU) {
        if (!formData.nouveauTypeNom.trim()) {
          setErreur('Le nom du type de congé est requis');
          setChargement(false);
          return;
        }
        const resType = await api.post('/types-conge', {
          nom: formData.nouveauTypeNom,
          nbJoursParAn: parseInt(formData.nouveauTypeJours, 10),
        });
        typeCongeId = resType.data.id;
      }

      const donnees = new FormData();
      donnees.append('typeCongeId', typeCongeId);
      donnees.append('dateDebut', formData.dateDebut);
      donnees.append('dateFin', formData.dateFin);
      donnees.append('motif', formData.motif);
      donnees.append('adresseConge', formData.adresseConge);
      donnees.append('telephoneConge', formData.telephoneConge);
      if (fichier) donnees.append('pieceJustificative', fichier);

      await api.post('/demandes-conge', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/employe/mes-conges');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setChargement(false);
    }
  }

  return (
    <LayoutEmploye>
      <h2 className="fw-bold mb-3">Nouvelle demande de congé</h2>

      <div className="card-cpg p-4" style={{ maxWidth: '600px' }}>
        {/* En-tête employé, auto-rempli */}
        {profil && (
          <div className="mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
            <div className="row g-2 small">
              <div className="col-6"><span className="text-muted">Matricule :</span> <strong>{profil.matricule}</strong></div>
              <div className="col-6"><span className="text-muted">Nom :</span> <strong>{profil.prenom} {profil.nom}</strong></div>
              <div className="col-6"><span className="text-muted">Département :</span> <strong>{profil.departement_nom}</strong></div>
              <div className="col-6"><span className="text-muted">Service :</span> <strong>{profil.service_nom}</strong></div>
              <div className="col-6"><span className="text-muted">Poste :</span> <strong>{profil.poste}</strong></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Type de congé</label>
            <select name="typeCongeId" value={formData.typeCongeId} onChange={handleChange} required className="form-select">
              <option value="">-- Sélectionner --</option>
              {typesConge.map((t) => (
                <option key={t.id} value={t.id}>{t.nom} ({t.nb_jours_par_an} j/an)</option>
              ))}
              <option value={NOUVEAU}>+ Nouveau type de congé</option>
            </select>
          </div>

          {formData.typeCongeId === NOUVEAU && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nom du type</label>
                <input type="text" name="nouveauTypeNom" value={formData.nouveauTypeNom} onChange={handleChange} required className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Jours par an</label>
                <input type="number" name="nouveauTypeJours" value={formData.nouveauTypeJours} onChange={handleChange} required className="form-control" />
              </div>
            </>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Date de début</label>
              <input type="date" name="dateDebut" value={formData.dateDebut} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Date de fin</label>
              <input type="date" name="dateFin" value={formData.dateFin} onChange={handleChange} required className="form-control" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Nombre de jours</label>
            <input type="text" value={nbJours > 0 ? `${nbJours} jour(s)` : '—'} disabled className="form-control" />
            <small className="text-muted">Calcul automatique</small>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Motif</label>
            <textarea name="motif" value={formData.motif} onChange={handleChange} className="form-control" rows={3} />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Pièce justificative (optionnel)</label>
            <input type="file" onChange={(e) => setFichier(e.target.files[0])} className="form-control" accept=".pdf,.jpg,.jpeg,.png" />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Adresse pendant le congé</label>
              <input type="text" name="adresseConge" value={formData.adresseConge} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold">Téléphone</label>
              <input type="tel" name="telephoneConge" value={formData.telephoneConge} onChange={handleChange} className="form-control" />
            </div>
          </div>

          {erreur && <div className="alert alert-danger py-2 small">{erreur}</div>}

          <div className="d-flex gap-2">
            <button type="submit" disabled={chargement} className="btn btn-cpg-primary px-4">
              {chargement ? 'Envoi...' : 'Envoyer'}
            </button>
            <button type="button" onClick={() => navigate('/employe/mes-conges')} className="btn btn-outline-secondary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </LayoutEmploye>
  );
}

export default DemanderConge;