import { useState, useEffect } from 'react';
import { getAll, validerParRh, refuser } from '../../services/demandeCongeService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const COULEURS_STATUT = {
  EN_ATTENTE: 'bg-warning text-dark',
  VALIDE_CHEF: 'bg-primary',
  VALIDE_RH: 'bg-success',
  REFUSE: 'bg-danger',
};

const LABELS_STATUT = {
  EN_ATTENTE: 'En attente',
  VALIDE_CHEF: 'Validé par le chef',
  VALIDE_RH: 'Validé (définitif)',
  REFUSE: 'Refusé',
};

function DemandesConge() {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const data = await getAll();
      setDemandes(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleValider(id) {
    if (!window.confirm('Valider définitivement cette demande ?')) return;
    try {
      await validerParRh(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    }
  }

  async function handleRefuser(id) {
    const commentaire = window.prompt('Motif du refus (obligatoire) :');
    if (!commentaire || !commentaire.trim()) {
      alert('Le motif de refus est obligatoire');
      return;
    }
    try {
      await refuser(id, commentaire);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du refus');
    }
  }

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-3">Gestion des demandes de congé</h2>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && demandes.length === 0 && (
        <p className="text-muted">Aucune demande pour l'instant.</p>
      )}

      {!chargement && demandes.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Nb jours</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td>{d.employe_prenom} {d.employe_nom} <span className="text-muted small">({d.matricule})</span></td>
                  <td>{d.type_conge_nom}</td>
                  <td>{d.date_debut} → {d.date_fin}</td>
                  <td>{d.nb_jours}</td>
                  <td>
                    <span className={`badge ${COULEURS_STATUT[d.statut]}`}>
                      {LABELS_STATUT[d.statut]}
                    </span>
                  </td>
                  <td>
                    {(d.statut === 'EN_ATTENTE' || d.statut === 'VALIDE_CHEF') && (
                      <>
                        <button onClick={() => handleValider(d.id)} className="btn btn-sm btn-outline-success me-1">
                          Valider
                        </button>
                        <button onClick={() => handleRefuser(d.id)} className="btn btn-sm btn-outline-danger">
                          Refuser
                        </button>
                      </>
                    )}
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

export default DemandesConge;