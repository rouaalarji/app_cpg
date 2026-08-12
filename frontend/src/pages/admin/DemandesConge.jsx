import { useState, useEffect } from 'react';
import { getAll, validerParRh, refuser } from '../../services/demandeCongeService';
import DetailDemandeConge from '../../components/DetailDemandeConge';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

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

function DemandesConge() {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);

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
      setDemandeSelectionnee(null);
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
      setDemandeSelectionnee(null);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du refus');
    }
  }

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-1">Gestion des demandes de congé</h2>
      <p className="text-muted mb-4">{demandes.length} demande(s) au total</p>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && demandes.length === 0 && (
          <div className="p-5 text-center text-muted">Aucune demande pour l'instant.</div>
        )}

        {!chargement && demandes.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Nb jours</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setDemandeSelectionnee(d)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-semibold">{d.employe_prenom} {d.employe_nom} <span className="text-muted small">({d.matricule})</span></td>
                  <td>{d.type_conge_nom}</td>
                  <td>{d.date_debut} → {d.date_fin}</td>
                  <td>{d.nb_jours}</td>
                  <td>
                    <span className={`badge ${BADGE_STATUT[d.statut]}`}>{LABELS_STATUT[d.statut]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {demandeSelectionnee && (
        <DetailDemandeConge
          demande={demandeSelectionnee}
          onFermer={() => setDemandeSelectionnee(null)}
          onValider={handleValider}
          onRefuser={handleRefuser}
        />
      )}
    </LayoutAdmin>
  );
}

export default DemandesConge;