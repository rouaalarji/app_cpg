import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesDemandes, annuler } from '../../services/demandeCongeService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

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

function MesConges() {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const data = await getMesDemandes();
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

  async function handleAnnuler(id) {
    if (!window.confirm('Annuler cette demande ?')) return;
    try {
      await annuler(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation");
    }
  }

  return (
    <LayoutEmploye>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Mes congés</h2>
        <Link to="/employe/mes-conges/demander" className="btn btn-cpg-primary">
          <i className="bi bi-plus-lg me-1"></i> Nouvelle demande
        </Link>
      </div>

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
                <th>Dates</th>
                <th>Nb jours</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Commentaire refus</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td>{d.date_debut} → {d.date_fin}</td>
                  <td>{d.nb_jours}</td>
                  <td>{d.motif || '—'}</td>
                  <td>
                    <span className={`badge ${COULEURS_STATUT[d.statut]}`}>
                      {LABELS_STATUT[d.statut]}
                    </span>
                  </td>
                  <td>{d.commentaire_refus || '—'}</td>
                  <td>
                    {d.statut === 'EN_ATTENTE' && (
                      <button onClick={() => handleAnnuler(d.id)} className="btn btn-sm btn-outline-danger">
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutEmploye>
  );
}

export default MesConges;