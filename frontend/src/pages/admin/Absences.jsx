import { useState, useEffect } from 'react';
import { getAllAdmin, getStats, update } from '../../services/absenceService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function Absences() {
  const [absences, setAbsences] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  async function charger() {
    try {
      const [absencesData, statsData] = await Promise.all([getAllAdmin(), getStats()]);
      setAbsences(absencesData);
      setStats(statsData);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleRequalifier(id, statutActuel) {
    const nouveauStatut = statutActuel === 'JUSTIFIEE' ? 'NON_JUSTIFIEE' : 'JUSTIFIEE';
    try {
      await update(id, { statut: nouveauStatut });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  const filtres = absences.filter((a) =>
    `${a.employe_prenom} ${a.employe_nom} ${a.matricule} ${a.service_nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-1">Absences</h2>
      <p className="text-muted mb-4">Vue globale et statistiques d'absentéisme</p>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card-cpg p-3" style={{ borderLeft: '4px solid var(--cpg-danger)' }}>
              <p className="text-muted small mb-1">Non justifiées (total)</p>
              <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-danger)' }}>{stats.totalNonJustifiees}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card-cpg p-3" style={{ borderLeft: '4px solid var(--cpg-warning)' }}>
              <p className="text-muted small mb-1">Ce mois-ci</p>
              <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-warning)' }}>{stats.totalCeMois}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card-cpg p-3 h-100">
              <p className="text-muted small mb-2 fw-semibold">Top employés (absences)</p>
              {stats.topEmployes.length === 0 && <p className="text-muted small mb-0">Aucune donnée</p>}
              {stats.topEmployes.map((e, i) => (
                <div key={i} className="d-flex justify-content-between small mb-1">
                  <span>{e.prenom} {e.nom}</span>
                  <span className="fw-semibold">{e.nb_absences}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats && stats.parService.length > 0 && (
        <div className="card-cpg p-3 mb-4">
          <p className="text-muted small mb-2 fw-semibold">Absences par service</p>
          <div className="d-flex flex-wrap gap-2">
            {stats.parService.map((s, i) => (
              <span key={i} className="badge badge-cpg-neutral">
                {s.service_nom} — {s.nb_absences}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && filtres.length === 0 && <div className="p-5 text-center text-muted">Aucune absence trouvée.</div>}

        {!chargement && filtres.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Service</th>
                <th>Dates</th>
                <th>Motif</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold">{a.employe_prenom} {a.employe_nom}</td>
                  <td>{a.service_nom}</td>
                  <td>{a.date_debut} → {a.date_fin}</td>
                  <td>{a.motif || '—'}</td>
                  <td>
                    <span className={`badge ${a.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                      {a.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button onClick={() => handleRequalifier(a.id, a.statut)} className="btn btn-sm btn-outline-secondary">
                      Marquer {a.statut === 'JUSTIFIEE' ? 'non justifiée' : 'justifiée'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default Absences;