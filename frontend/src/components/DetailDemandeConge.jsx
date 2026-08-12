import Modal from './Modal';

const BADGE_STATUT = {
  EN_ATTENTE: 'badge-cpg-warning',
  VALIDE_CHEF: 'badge-cpg-neutral',
  VALIDE_RH: 'badge-cpg-success',
  REFUSE: 'badge-cpg-danger',
};

const LABELS_STATUT = {
  EN_ATTENTE: 'En attente',
  VALIDE_CHEF: 'Validée par le chef',
  VALIDE_RH: 'Validée (définitif)',
  REFUSE: 'Refusée',
};

function DetailDemandeConge({ demande, onFermer, onValider, onRefuser }) {
  if (!demande) return null;

  const peutAgir = demande.statut === 'EN_ATTENTE' || demande.statut === 'VALIDE_CHEF';

  return (
    <Modal titre="Demande de congé" onFermer={onFermer}>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <span className="text-muted small">Référence #{demande.id}</span>
        <span className={`badge ${BADGE_STATUT[demande.statut]}`}>{LABELS_STATUT[demande.statut]}</span>
      </div>

      <div
        className="p-3 mb-3 rounded"
        style={{ background: 'var(--cpg-primary-light)', border: '1px solid var(--cpg-border)' }}
      >
        <p className="text-muted small mb-1">Employé</p>
        <p className="fw-bold mb-0">{demande.employe_prenom} {demande.employe_nom}</p>
        <p className="text-muted small mb-0">Matricule : {demande.matricule}</p>
      </div>

      <table className="table table-borderless mb-3" style={{ fontSize: '14px' }}>
        <tbody>
          <tr>
            <td className="text-muted py-1" style={{ width: '160px' }}>Type de congé</td>
            <td className="fw-semibold py-1">{demande.type_conge_nom}</td>
          </tr>
          <tr>
            <td className="text-muted py-1">Période</td>
            <td className="fw-semibold py-1">{demande.date_debut} → {demande.date_fin}</td>
          </tr>
          <tr>
            <td className="text-muted py-1">Nombre de jours</td>
            <td className="fw-semibold py-1">{demande.nb_jours} jour(s)</td>
          </tr>
          <tr>
            <td className="text-muted py-1">Motif</td>
            <td className="fw-semibold py-1">{demande.motif || '—'}</td>
          </tr>
          {demande.adresse_conge && (
            <tr>
              <td className="text-muted py-1">Adresse pendant le congé</td>
              <td className="fw-semibold py-1">{demande.adresse_conge}</td>
            </tr>
          )}
          {demande.telephone_conge && (
            <tr>
              <td className="text-muted py-1">Téléphone</td>
              <td className="fw-semibold py-1">{demande.telephone_conge}</td>
            </tr>
          )}
          <tr>
            <td className="text-muted py-1">Date de la demande</td>
            <td className="fw-semibold py-1">{new Date(demande.date_creation).toLocaleString('fr-FR')}</td>
          </tr>
          {demande.piece_justificative && (
            <tr>
              <td className="text-muted py-1">Justificatif</td>
              <td className="py-1">
                <a href={`http://localhost:5000${demande.piece_justificative}`} target="_blank" rel="noreferrer">
                  <i className="bi bi-file-earmark-text me-1"></i>Voir le fichier
                </a>
              </td>
            </tr>
          )}
          {demande.commentaire_refus && (
            <tr>
              <td className="text-muted py-1">Motif du refus</td>
              <td className="fw-semibold py-1 text-danger">{demande.commentaire_refus}</td>
            </tr>
          )}
        </tbody>
      </table>

      {peutAgir && (
        <div className="d-flex gap-2">
          <button onClick={() => onValider(demande.id)} className="btn btn-cpg-primary flex-grow-1">
            <i className="bi bi-check-lg me-1"></i> Valider
          </button>
          <button onClick={() => onRefuser(demande.id)} className="btn btn-outline-danger flex-grow-1">
            <i className="bi bi-x-lg me-1"></i> Refuser
          </button>
        </div>
      )}
    </Modal>
  );
}

export default DetailDemandeConge;