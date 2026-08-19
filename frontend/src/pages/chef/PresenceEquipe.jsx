import { useState, useEffect, useCallback } from 'react';
import { getMonEquipe } from '../../services/employeService';
import { marquerPresence } from '../../services/presenceService';
import { getStatsChef } from '../../services/dashboardService';
import api from '../../services/api';
import LayoutChef from '../../components/layout/LayoutChef';

function aujourdHuiStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDateAffichage(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function PresenceEquipe() {
  const [dateSelectionnee, setDateSelectionnee] = useState(aujourdHuiStr());
  const [serviceInfo, setServiceInfo] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [pointages, setPointages] = useState({});
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [messageSucces, setMessageSucces] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      const [infoRes, membres, statsData] = await Promise.all([
        api.get('/services/mon-service'),
        getMonEquipe(dateSelectionnee),
        getStatsChef(),
      ]);
      setServiceInfo(infoRes.data);
      setEquipe(membres);
      setStats(statsData);

      const snapshot = {};
      membres.forEach((emp) => {
        snapshot[emp.id] = {
          heureArrivee: emp.heure_arrivee || null,
          heureDepart: emp.heure_depart || null,
          statut: emp.conge_id ? 'EN_CONGE' : (emp.statut_presence || null),
          enConge: !!emp.conge_id,
          modifie: false,
        };
      });
      setPointages(snapshot);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }, [dateSelectionnee]);

  useEffect(() => {
    charger();
  }, [charger]);

  function heureActuelle() {
    return new Date().toTimeString().split(' ')[0];
  }

  function marquerArrivee(employeId) {
    setPointages((prev) => ({
      ...prev,
      [employeId]: { ...prev[employeId], heureArrivee: heureActuelle(), statut: 'PRESENT', modifie: true },
    }));
  }

  function marquerRetard(employeId) {
    setPointages((prev) => ({
      ...prev,
      [employeId]: { ...prev[employeId], heureArrivee: heureActuelle(), statut: 'RETARD', modifie: true },
    }));
  }

  function marquerDepart(employeId) {
    setPointages((prev) => ({
      ...prev,
      [employeId]: { ...prev[employeId], heureDepart: heureActuelle(), modifie: true },
    }));
  }

  function marquerAbsent(employeId) {
    setPointages((prev) => ({
      ...prev,
      [employeId]: { ...prev[employeId], heureArrivee: null, heureDepart: null, statut: 'ABSENT', modifie: true },
    }));
  }

  async function handleEnregistrer() {
    setEnregistrement(true);
    setErreur('');
    try {
      const modifies = Object.entries(pointages).filter(([, p]) => p.modifie);
      for (const [employeId, p] of modifies) {
        await marquerPresence({
          employeId,
          date: dateSelectionnee,
          heureArrivee: p.heureArrivee,
          heureDepart: p.heureDepart,
          statut: p.statut || 'PRESENT',
        });
      }
      setMessageSucces(`Pointage enregistré pour ${modifies.length} employé(s).`);
      await charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setEnregistrement(false);
    }
  }

  function handleReinitialiser() {
    charger();
  }

  function handleImprimer() {
    window.print();
  }

  function handleExporter() {
    const entetes = ['Matricule', 'Nom', 'Prénom', 'Arrivée', 'Départ', 'Statut'];
    const lignes = equipe.map((emp) => {
      const p = pointages[emp.id] || {};
      return [emp.matricule, emp.nom, emp.prenom, p.heureArrivee || '', p.heureDepart || '', p.statut || 'Non pointé'];
    });
    const csv = [entetes, ...lignes].map((l) => l.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presences_${dateSelectionnee}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const nbModifies = Object.values(pointages).filter((p) => p.modifie).length;

  return (
    <LayoutChef>
      {/* En-tête contextuel */}
      <div className="card-cpg p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h4 className="fw-bold mb-1">Feuille de pointage</h4>
            <p className="text-muted mb-0 text-capitalize">{formatDateAffichage(dateSelectionnee)}</p>
            {serviceInfo && (
              <div className="d-flex gap-3 mt-2 flex-wrap">
                <span className="badge badge-cpg-neutral">
                  <i className="bi bi-diagram-3 me-1"></i>{serviceInfo.departement_nom}
                </span>
                <span className="badge badge-cpg-neutral">
                  <i className="bi bi-buildings me-1"></i>{serviceInfo.code} — {serviceInfo.service_nom}
                </span>
                <span className="badge badge-cpg-neutral">
                  <i className="bi bi-person-badge me-1"></i>Chef : {serviceInfo.chef_nom}
                </span>
              </div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Date du pointage</label>
            <input
              type="date"
              value={dateSelectionnee}
              onChange={(e) => setDateSelectionnee(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {messageSucces && (
        <div className="alert d-flex align-items-center gap-2 mb-3" style={{ background: 'var(--cpg-success-light)', color: '#047857', border: 'none', borderRadius: '10px' }}>
          <i className="bi bi-check-circle-fill"></i> {messageSucces}
        </div>
      )}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {/* Barre d'actions */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <span className="text-muted small">
          {nbModifies > 0 ? `${nbModifies} modification(s) non enregistrée(s)` : 'Aucune modification en attente'}
        </span>
        <div className="d-flex gap-2">
          <button onClick={handleExporter} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Exporter
          </button>
          <button onClick={handleImprimer} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-printer me-1"></i> Imprimer
          </button>
          <button onClick={handleReinitialiser} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
          </button>
          <button onClick={handleEnregistrer} disabled={nbModifies === 0 || enregistrement} className="btn btn-cpg-primary btn-sm">
            <i className="bi bi-save me-1"></i> {enregistrement ? 'Enregistrement...' : 'Enregistrer le pointage'}
          </button>
        </div>
      </div>

      {chargement && <p>Chargement...</p>}

      {!chargement && (
        <div className="card-cpg p-0 overflow-hidden mb-4">
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Matricule</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipe.map((emp) => {
                const p = pointages[emp.id] || {};
                const aArrivee = !!p.heureArrivee;
                const estAbsent = p.statut === 'ABSENT';
                return (
                  <tr key={emp.id}>
                    <td className="fw-semibold">{emp.prenom} {emp.nom}</td>
                    <td className="text-muted">{emp.matricule}</td>
                    <td>{p.heureArrivee || '—'}</td>
                    <td>{p.heureDepart || '—'}</td>
                    <td>
                      <span className={`badge ${p.statut === 'PRESENT' ? 'badge-cpg-success' :
                        p.statut === 'ABSENT' ? 'badge-cpg-danger' :
                          p.statut === 'RETARD' ? 'badge-cpg-warning' :
                            p.statut === 'EN_CONGE' ? 'badge-cpg-neutral' :
                              'badge-cpg-neutral'
                        }`} style={p.statut === 'EN_CONGE' ? { background: '#e0e7ff', color: '#4338ca' } : {}}>
                        {p.statut === 'PRESENT' ? 'Présent' :
                          p.statut === 'ABSENT' ? 'Absent' :
                            p.statut === 'RETARD' ? 'Retard' :
                              p.statut === 'EN_CONGE' ? 'En congé' :
                                'Non pointé'}
                      </span>
                    </td>
                    <td className="text-end">
                      {p.enConge ? (
                        <span className="text-muted small fst-italic">
                          <i className="bi bi-airplane me-1"></i>Congé en cours
                        </span>
                      ) : (
                        <>
                          <button onClick={() => marquerArrivee(emp.id)} disabled={aArrivee || estAbsent} className="btn btn-sm btn-outline-success me-1">
                            Arrivée
                          </button>
                          <button onClick={() => marquerRetard(emp.id)} disabled={aArrivee || estAbsent} className="btn btn-sm btn-outline-warning me-1">
                            Retard
                          </button>
                          <button onClick={() => marquerDepart(emp.id)} disabled={!aArrivee || !!p.heureDepart || estAbsent} className="btn btn-sm btn-outline-primary me-1">
                            Départ
                          </button>
                          <button onClick={() => marquerAbsent(emp.id)} disabled={estAbsent} className="btn btn-sm btn-outline-danger">
                            Absent
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Résumé de la journée */}
      {!chargement && stats && (
        <div className="card-cpg p-4">
          <h6 className="fw-bold mb-3">Résumé de la journée</h6>
          <div className="row g-3 text-center">
            <div className="col">
              <p className="text-muted small mb-1">Total employés</p>
              <p className="fs-4 fw-bold mb-0">{stats.totalEmployes}</p>
            </div>
            <div className="col">
              <p className="text-muted small mb-1">Présents</p>
              <p className="fs-4 fw-bold mb-0" style={{ color: 'var(--cpg-success)' }}>{stats.presents}</p>
            </div>
            <div className="col">
              <p className="text-muted small mb-1">Absents</p>
              <p className="fs-4 fw-bold mb-0" style={{ color: 'var(--cpg-danger)' }}>{stats.absents}</p>
            </div>
            <div className="col">
              <p className="text-muted small mb-1">Retards</p>
              <p className="fs-4 fw-bold mb-0" style={{ color: 'var(--cpg-warning)' }}>{stats.retards}</p>
            </div>
            <div className="col">
              <p className="text-muted small mb-1">En congé</p>
              <p className="fs-4 fw-bold mb-0" style={{ color: 'var(--cpg-primary)' }}>{stats.enConge}</p>
            </div>
          </div>
        </div>
      )}
    </LayoutChef>
  );
}

export default PresenceEquipe;