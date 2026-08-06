import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LayoutEmploye from '../../components/layout/LayoutEmploye';
import LayoutChef from '../../components/layout/LayoutChef';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function DeclarerAbsence() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();

  const LayoutSelon = utilisateur?.role === 'CHEF'
    ? LayoutChef
    : (utilisateur?.role === 'RH' || utilisateur?.role === 'ADMIN')
      ? LayoutAdmin
      : LayoutEmploye;

  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [fichier, setFichier] = useState(null);

  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    motif: '',
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const donnees = new FormData();
      donnees.append('dateDebut', formData.dateDebut);
      donnees.append('dateFin', formData.dateFin);
      donnees.append('motif', formData.motif);
      if (fichier) donnees.append('justificatif', fichier);

      await api.post('/absences', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/employe/mes-absences');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la déclaration');
    } finally {
      setChargement(false);
    }
  }

  return (
    <LayoutSelon>
      <h2 className="fw-bold mb-3">Déclarer une absence</h2>

      <div className="card-cpg p-4" style={{ maxWidth: '480px' }}>
        <form onSubmit={handleSubmit}>
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
            <label className="form-label small fw-semibold">Motif</label>
            <textarea name="motif" value={formData.motif} onChange={handleChange} className="form-control" rows={3} />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Justificatif (optionnel)</label>
            <input type="file" onChange={(e) => setFichier(e.target.files[0])} className="form-control" accept=".pdf,.jpg,.jpeg,.png" />
            <small className="text-muted">Un justificatif joint marque automatiquement l'absence comme "Justifiée".</small>
          </div>

          {erreur && <div className="alert alert-danger py-2 small">{erreur}</div>}

          <div className="d-flex gap-2">
            <button type="submit" disabled={chargement} className="btn btn-cpg-primary px-4">
              {chargement ? 'Envoi...' : 'Déclarer'}
            </button>
            <button type="button" onClick={() => navigate('/employe/mes-absences')} className="btn btn-outline-secondary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </LayoutSelon>
  );
}

export default DeclarerAbsence;