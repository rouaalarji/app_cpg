import Modal from '../../components/Modal';

function DetailAbsence({ absence, onFermer, onJustifier, onNonJustifier }) {
  if (!absence) return null;

  return (
    <Modal titre="Détail de l'absence" onFermer={onFermer}>
      <div
        className="p-3 mb-3 rounded"
        style={{ background: 'var(--cpg-primary-light)', border: '1px solid var(--cpg-border)' }}
      >
        <p className="text-muted small mb-1">Employé</p>
        <p className="fw-bold mb-0">{absence.employe_prenom} {absence.employe_nom}</p>
        <p className="text-muted small mb-0">{absence.matricule} — {absence.service_nom}</p>
      </div>

      {absence.declaree_par_employe ? (
        <div className="alert alert-info py-2 small mb-3">
          <i className="bi bi-check-circle me-1"></i>
          Une déclaration a été soumise par l'employé.
        </div>
      ) : (
        <div className="alert alert-warning py-2 small mb-3">
          <i className="bi bi-exclamation-triangle me-1"></i>
          Absence constatée automatiquement, aucune déclaration reçue.
        </div>
      )}

      <table className="table table-borderless mb-3" style={{ fontSize: '14px' }}>
        <tbody>
          <tr>
            <td className="text-muted py-1" style={{ width: '140px' }}>Période</td>
            <td className="fw-semibold py-1">{absence.date_debut} → {absence.date_fin}</td>
          </tr>
          <tr>
            <td className="text-muted py-1">Motif</td>
            <td className="fw-semibold py-1">{absence.motif || '—'}</td>
          </tr>
          <tr>
            <td className="text-muted py-1">Justificatif</td>
            <td className="py-1">
              {absence.justificatif ? (
                <a href={`http://localhost:5000${absence.justificatif}`} target="_blank" rel="noreferrer">
                  <i className="bi bi-file-earmark-text me-1"></i>Voir le fichier
                </a>
              ) : (
                <span className="text-muted">Aucun</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-muted py-1">Statut actuel</td>
            <td className="py-1">
              <span className={`badge ${absence.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                {absence.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button onClick={() => onJustifier(absence.id)} className="btn btn-cpg-primary flex-grow-1">
          <i className="bi bi-check-lg me-1"></i> Marquer justifiée
        </button>
        <button onClick={() => onNonJustifier(absence.id)} className="btn btn-outline-danger flex-grow-1">
          <i className="bi bi-x-lg me-1"></i> Marquer non justifiée
        </button>
      </div>
    </Modal>
  );
}

export default DetailAbsence;