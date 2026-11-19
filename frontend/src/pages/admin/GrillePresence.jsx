import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getGrille } from '../../services/presenceService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const COULEURS_STATUT = {
  PRESENT: { bg: '#d1fae5', color: '#047857', label: 'P' },
  RETARD: { bg: '#fef3c7', color: '#b45309', label: 'R' },
  ABSENT: { bg: '#fee2e2', color: '#b91c1c', label: 'A' },
};

function dateLocaleStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}

function nbJoursDansMois(annee, mois) {
  return new Date(annee, mois, 0).getDate();
}

// Construit [dateDebut, dateFin] selon le mois choisi et le mode (quinzaine 1 / quinzaine 2 / mois entier)
function calculerPeriode(moisStr, mode) {
  const [annee, mois] = moisStr.split('-').map(Number);
  const dernierJour = nbJoursDansMois(annee, mois);

  if (mode === 'Q1') {
    return [
      dateLocaleStr(new Date(annee, mois - 1, 1)),
      dateLocaleStr(new Date(annee, mois - 1, 15)),
    ];
  }
  if (mode === 'Q2') {
    return [
      dateLocaleStr(new Date(annee, mois - 1, 16)),
      dateLocaleStr(new Date(annee, mois - 1, dernierJour)),
    ];
  }
  // mois entier
  return [
    dateLocaleStr(new Date(annee, mois - 1, 1)),
    dateLocaleStr(new Date(annee, mois - 1, dernierJour)),
  ];
}

function listeJours(dateDebut, dateFin) {
  const jours = [];
  let courant = new Date(dateDebut + 'T00:00:00');
  const fin = new Date(dateFin + 'T00:00:00');
  while (courant <= fin) {
    jours.push(dateLocaleStr(courant));
    courant.setDate(courant.getDate() + 1);
  }
  return jours;
}

function Pastille({ jourData }) {
  if (!jourData) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', color: '#94a3b8', fontSize: '11px' }}
        title="Non pointé"
      >
        —
      </div>
    );
  }
  const style = COULEURS_STATUT[jourData.statut] || { bg: '#f1f5f9', color: '#64748b', label: '?' };
  const titre = jourData.heure_arrivee
    ? `${jourData.statut} — arrivée ${jourData.heure_arrivee.slice(0, 5)}`
    : jourData.statut;

  return (
    <div
      className="d-flex align-items-center justify-content-center fw-semibold"
      style={{ width: '32px', height: '32px', borderRadius: '6px', background: style.bg, color: style.color, fontSize: '12px' }}
      title={titre}
    >
      {style.label}
    </div>
  );
}

function GrillePresence() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [moisStr, setMoisStr] = useState(new Date().toISOString().slice(0, 7));
  const [mode, setMode] = useState('MOIS'); // 'Q1' | 'Q2' | 'MOIS'
  const [grille, setGrille] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.get('/services').then((res) => {
      setServices(res.data);
      if (res.data.length > 0) setServiceId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, moisStr, mode]);

  async function charger() {
    setChargement(true);
    setErreur('');
    try {
      const [debut, fin] = calculerPeriode(moisStr, mode);
      const data = await getGrille(serviceId, debut, fin);
      setGrille(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement de la grille');
    } finally {
      setChargement(false);
    }
  }

  const [dateDebut, dateFin] = calculerPeriode(moisStr, mode);
  const jours = listeJours(dateDebut, dateFin);

  function totauxEmploye(emp) {
    let presents = 0;
    let absents = 0;
    let retards = 0;
    jours.forEach((j) => {
      const d = emp.presences[j];
      if (!d) return;
      if (d.statut === 'PRESENT') presents++;
      else if (d.statut === 'ABSENT') absents++;
      else if (d.statut === 'RETARD') retards++;
    });
    return { presents, absents, retards };
  }

  function formatJourCourt(jourStr) {
    const d = new Date(jourStr + 'T00:00:00');
    return String(d.getDate());
  }

  const styleImpression = `
    @media print {
      .no-print { display: none !important; }
    }
  `;

  return (
    <LayoutAdmin>
      <style>{styleImpression}</style>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Grille de présence</h2>
          <p className="text-muted mb-0">Vue d'ensemble des présences par service et par période</p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 no-print"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer"></i> Imprimer
        </button>
      </div>

      {/* Filtres */}
      <div className="card-cpg p-3 mb-4 no-print">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Service</label>
            <select className="form-select" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Mois</label>
            <input
              type="month"
              className="form-control"
              value={moisStr}
              onChange={(e) => setMoisStr(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-semibold">Période</label>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${mode === 'Q1' ? 'btn-cpg-primary' : 'btn-outline-secondary'}`}
                onClick={() => setMode('Q1')}
              >
                1 → 15
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'Q2' ? 'btn-cpg-primary' : 'btn-outline-secondary'}`}
                onClick={() => setMode('Q2')}
              >
                16 → fin
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'MOIS' ? 'btn-cpg-primary' : 'btn-outline-secondary'}`}
                onClick={() => setMode('MOIS')}
              >
                Mois entier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="d-flex align-items-center gap-4 mb-3 flex-wrap">
        {Object.entries(COULEURS_STATUT).map(([key, s]) => (
          <div key={key} className="d-flex align-items-center gap-2">
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: s.bg }}></div>
            <span className="small text-muted">
              {key === 'PRESENT' ? 'Présent' : key === 'RETARD' ? 'Retard' : 'Absent'}
            </span>
          </div>
        ))}
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#f1f5f9' }}></div>
          <span className="small text-muted">Non pointé</span>
        </div>
      </div>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && grille.length === 0 && (
          <div className="p-5 text-center text-muted">Aucun employé dans ce service.</div>
        )}

        {!chargement && grille.length > 0 && (
          <div className="table-responsive">
            <table className="table table-cpg mb-0" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, minWidth: '160px' }}>
                    Employé
                  </th>
                  {jours.map((j) => (
                    <th key={j} className="text-center" style={{ minWidth: '36px' }}>
                      {formatJourCourt(j)}
                    </th>
                  ))}
                  <th className="text-center" style={{ minWidth: '110px' }}>Totaux</th>
                </tr>
              </thead>
              <tbody>
                {grille.map((emp) => {
                  const totaux = totauxEmploye(emp);
                  return (
                    <tr key={emp.id}>
                      <td
                        className="fw-semibold"
                        style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}
                      >
                        {emp.prenom} {emp.nom}
                        <div className="text-muted fw-normal" style={{ fontSize: '11px' }}>{emp.matricule}</div>
                      </td>
                      {jours.map((j) => (
                        <td key={j} className="text-center align-middle p-1">
                          <Pastille jourData={emp.presences[j]} />
                        </td>
                      ))}
                      <td className="text-center align-middle">
                        <span className="badge badge-cpg-success me-1" title="Présences">{totaux.presents}</span>
                        <span className="badge badge-cpg-warning me-1" title="Retards">{totaux.retards}</span>
                        <span className="badge badge-cpg-danger" title="Absences">{totaux.absents}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default GrillePresence;