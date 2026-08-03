import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesDemandes, annuler } from '../../services/demandeCongeService';
import LayoutChef from '../../components/layout/LayoutChef';

const BADGE_STATUT = {
  EN_ATTENTE: 'badge-cpg-warning',
  VALIDE_CHEF: 'badge-cpg-neutral',
  VALIDE_RH: 'badge-cpg-success',
  REFUSE: 'badge-cpg-danger',
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
    <LayoutChef>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Mes congés</h2>
          <p className="text-muted mb-0">{demandes.length} demande(s) au total</p>
        </div>
        <Link to="/chef/mes-conges/demander" className="btn btn-cpg-primary d-flex align-items-center gap-1">
          <i className="bi bi-plus-lg"></i> Nouvelle demande
        </Link>
      </div>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && demandes.length === 0 && (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-calendar-check fs-1 mb-2 d-block"></i>
            Aucune demande pour l'instant.
          </div>
        )}

        {!chargement && demandes.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Dates</th>
                <th>Nb jours</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Commentaire refus</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td>{d.date_debut} → {d.date_fin}</td>
                  <td>{d.nb_jours}</td>
                  <td>{d.motif || '—'}</td>
                  <td>
                    <span className={`badge ${BADGE_STATUT[d.statut]}`}>
                      {LABELS_STATUT[d.statut]}
                    </span>
                  </td>
                  <td className="text-muted">{d.commentaire_refus || '—'}</td>
                  <td className="text-end">
                    {d.statut === 'EN_ATTENTE' && (
                      <button onClick={() => handleAnnuler(d.id)} className="btn btn-sm btn-light text-danger">
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutChef>
  );
}

export default MesConges;