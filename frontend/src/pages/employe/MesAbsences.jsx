import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesAbsences, declarerSurExistante } from '../../services/absenceService';
import Modal from '../../components/Modal';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function MesAbsences() {
  const [absences, setAbsences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [absenceEnDeclaration, setAbsenceEnDeclaration] = useState(null);
  const [motif, setMotif] = useState('');
  const [fichier, setFichier] = useState(null);
  const [erreurForm, setErreurForm] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function charger() {
    try {
      const data = await getMesAbsences();
      setAbsences(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function ouvrirDeclaration(absence) {
    setAbsenceEnDeclaration(absence);
    setMotif(absence.motif || '');
    setFichier(null);
    setErreurForm('');
  }

  async function handleSubmitDeclaration(e) {
    e.preventDefault();
    setErreurForm('');
    setEnvoiEnCours(true);
    try {
      const donnees = new FormData();
      donnees.append('motif', motif);
      if (fichier) donnees.append('justificatif', fichier);

      await declarerSurExistante(absenceEnDeclaration.id, donnees);
      setAbsenceEnDeclaration(null);
      charger();
    } catch (err) {
      setErreurForm(err.response?.data?.message || 'Erreur lors de la déclaration');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <LayoutEmploye>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Mes absences</h2>
          <p className="text-muted mb-0">{absences.length} absence(s)</p>
        </div>
        
      </div>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && absences.length === 0 && (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-x-circle fs-1 mb-2 d-block"></i>
            Aucune absence pour l'instant.
          </div>
        )}

        {!chargement && absences.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Dates</th>
                <th>Motif</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((a) => (
                <tr key={a.id}>
                  <td>{a.date_debut} → {a.date_fin}</td>
                  <td>{a.motif || '—'}</td>
                  <td>
                    <span className={`badge ${a.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                      {a.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
                    </span>
                  </td>
                  <td className="text-end">
                    {!a.declaree_par_employe ? (
                      <button onClick={() => ouvrirDeclaration(a)} className="btn btn-sm btn-cpg-primary">
                        Déclarer
                      </button>
                    ) : (
                      <span className="badge badge-cpg-neutral">
                        <i className="bi bi-check-circle me-1"></i>Déclarée
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {absenceEnDeclaration && (
        <Modal titre="Déclarer cette absence" onFermer={() => setAbsenceEnDeclaration(null)}>
          <p className="text-muted small mb-3">
            Période concernée : <strong>{absenceEnDeclaration.date_debut} → {absenceEnDeclaration.date_fin}</strong>
          </p>
          <form onSubmit={handleSubmitDeclaration}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Motif</label>
              <textarea value={motif} onChange={(e) => setMotif(e.target.value)} className="form-control" rows={3} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Justificatif (optionnel)</label>
              <input type="file" onChange={(e) => setFichier(e.target.files[0])} className="form-control" accept=".pdf,.jpg,.jpeg,.png" />
              <small className="text-muted">Un justificatif joint marque automatiquement l'absence comme "Justifiée".</small>
            </div>
            {erreurForm && <div className="alert alert-danger py-2 small">{erreurForm}</div>}
            <div className="d-flex gap-2">
              <button type="submit" disabled={envoiEnCours} className="btn btn-cpg-primary flex-grow-1">
                {envoiEnCours ? 'Envoi...' : 'Confirmer la déclaration'}
              </button>
              <button type="button" onClick={() => setAbsenceEnDeclaration(null)} className="btn btn-outline-secondary">
                Annuler
              </button>
            </div>
          </form>
        </Modal>
      )}
    </LayoutEmploye>
  );
}

export default MesAbsences;