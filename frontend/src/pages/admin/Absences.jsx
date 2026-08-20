import { useState, useEffect } from 'react';
import { getAllAdmin, getStats, update, getHistoriqueMensuel, getByMois } from '../../services/absenceService';
import DetailAbsence from '../../pages/admin/DetailAbsence';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function formatMoisLabel(moisStr) {
  const [annee, mois] = moisStr.split('-');
  return `${NOMS_MOIS[parseInt(mois, 10) - 1]} ${annee}`;
}

function ModaleHistorique({ onFermer }) {
  const [historique, setHistorique] = useState([]);
  const [moisSelectionne, setMoisSelectionne] = useState(null);
  const [detailMois, setDetailMois] = useState([]);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getHistoriqueMensuel()
      .then((data) => {
        setHistorique(data);
        if (data.length > 0) setMoisSelectionne(data[data.length - 1].mois);
      })
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    if (!moisSelectionne) return;
    setChargementDetail(true);
    getByMois(moisSelectionne)
      .then(setDetailMois)
      .finally(() => setChargementDetail(false));
  }, [moisSelectionne]);

  const donneesGraphique = historique.map((h) => ({
    mois: formatMoisLabel(h.mois),
    moisKey: h.mois,
    Justifiées: h.justifiees,
    'Non justifiées': h.non_justifiees,
  }));

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
      onClick={onFermer}
    >
      <div
        className="bg-white p-4"
        style={{ width: '90%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto', borderRadius: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Historique des absences par mois</h4>
          <button className="btn-close" onClick={onFermer}></button>
        </div>

        {chargement && <p className="text-muted">Chargement...</p>}

        {!chargement && historique.length === 0 && (
          <p className="text-muted text-center py-4">Aucune donnée disponible sur les 12 derniers mois.</p>
        )}

        {!chargement && historique.length > 0 && (
          <>
            <div style={{ width: '100%', height: 260 }} className="mb-4">
              <ResponsiveContainer>
                <BarChart data={donneesGraphique} onClick={(e) => {
                  if (e && e.activePayload) setMoisSelectionne(e.activePayload[0].payload.moisKey);
                }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mois" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="Justifiées" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} cursor="pointer" />
                  <Bar dataKey="Non justifiées" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <label className="fw-semibold small mb-0">Détail du mois :</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={moisSelectionne || ''}
                onChange={(e) => setMoisSelectionne(e.target.value)}
              >
                {historique.map((h) => (
                  <option key={h.mois} value={h.mois}>{formatMoisLabel(h.mois)}</option>
                ))}
              </select>
            </div>

            {chargementDetail && <p className="text-muted small">Chargement du détail...</p>}

            {!chargementDetail && (
              <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table table-cpg table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Service</th>
                      <th>Dates</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailMois.length === 0 && (
                      <tr><td colSpan="4" className="text-center text-muted py-3">Aucune absence ce mois-ci.</td></tr>
                    )}
                    {detailMois.map((a) => (
                      <tr key={a.id}>
                        <td>{a.employe_prenom} {a.employe_nom}</td>
                        <td>{a.service_nom}</td>
                        <td>{a.date_debut} → {a.date_fin}</td>
                        <td>
                          <span className={`badge ${a.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                            {a.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Absences() {
  const [absences, setAbsences] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [absenceSelectionnee, setAbsenceSelectionnee] = useState(null);

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

  async function handleJustifier(id) {
    await update(id, { statut: 'JUSTIFIEE' });
    setAbsenceSelectionnee(null);
    charger();
  }

  async function handleNonJustifier(id) {
    await update(id, { statut: 'NON_JUSTIFIEE' });
    setAbsenceSelectionnee(null);
    charger();
  }

  const filtres = absences.filter((a) =>
    `${a.employe_prenom} ${a.employe_nom} ${a.matricule} ${a.service_nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-1">
        <div>
          <h2 className="fw-bold mb-1">Absences</h2>
          <p className="text-muted mb-4">Vue globale et statistiques d'absentéisme</p>
        </div>
        <button
          className="btn btn-cpg-primary d-flex align-items-center gap-2"
          onClick={() => setModaleOuverte(true)}
        >
          <i className="bi bi-bar-chart-line"></i> Historique par mois
        </button>
      </div>

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
                <th>Déclaration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((a) => (
                <tr key={a.id} onClick={() => setAbsenceSelectionnee(a)} style={{ cursor: 'pointer' }}>
                  <td className="fw-semibold">{a.employe_prenom} {a.employe_nom}</td>
                  <td>{a.service_nom}</td>
                  <td>{a.date_debut} → {a.date_fin}</td>
                  <td>{a.motif || '—'}</td>
                  <td>
                    {a.declaree_par_employe ? (
                      <span className="badge badge-cpg-success"><i className="bi bi-check-circle me-1"></i>Déclarée</span>
                    ) : (
                      <span className="badge badge-cpg-neutral">Aucune</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${a.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                      {a.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modaleOuverte && <ModaleHistorique onFermer={() => setModaleOuverte(false)} />}

      {absenceSelectionnee && (
        <DetailAbsence
          absence={absenceSelectionnee}
          onFermer={() => setAbsenceSelectionnee(null)}
          onJustifier={handleJustifier}
          onNonJustifier={handleNonJustifier}
        />
      )}
    </LayoutAdmin>
  );
}

export default Absences;