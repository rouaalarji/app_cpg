import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatsChef, getDemandesConge } from '../../services/dashboardService';
import { getMonEquipe } from '../../services/employeService';
import LayoutChef from '../../components/layout/LayoutChef';

function badgeStatutPresence(statut) {
  const map = {
    PRESENT: { label: 'Présent', couleur: '#22c55e' },
    ABSENT: { label: 'Absent', couleur: '#ef4444' },
    RETARD: { label: 'En retard', couleur: '#f59e0b' },
    CONGE: { label: 'En congé', couleur: 'var(--cpg-primary)' },
  };
  return map[statut] || { label: 'Non pointé', couleur: '#94a3b8' };
}

function DashboardChef() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [demandesConge, setDemandesConge] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const [statsData, equipeData, congesData] = await Promise.all([
          getStatsChef(),
          getMonEquipe(),
          getDemandesConge(),
        ]);
        setStats(statsData);
        setEquipe(equipeData);
        setDemandesConge(congesData);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-1">Tableau de bord Chef</h2>
      <p className="text-muted mb-4">Connecté en tant que : {utilisateur?.email}</p>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && stats && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid var(--cpg-accent)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Employés du service</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-accent)' }}>{stats.totalEmployes}</p>
                  </div>
                  <i className="bi bi-people fs-1" style={{ color: 'var(--cpg-accent)', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid var(--cpg-success)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Présents aujourd'hui</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-success)' }}>{stats.presents}</p>
                  </div>
                  <i className="bi bi-check-circle fs-1" style={{ color: 'var(--cpg-success)', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid var(--cpg-danger)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Absents aujourd'hui</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-danger)' }}>{stats.absents}</p>
                  </div>
                  <i className="bi bi-x-circle fs-1" style={{ color: 'var(--cpg-danger)', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid var(--cpg-warning)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">En retard aujourd'hui</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-warning)' }}>{stats.retards}</p>
                  </div>
                  <i className="bi bi-clock-history fs-1" style={{ color: 'var(--cpg-warning)', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid var(--cpg-primary)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">En congé aujourd'hui</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--cpg-primary)' }}>{stats.enConge}</p>
                  </div>
                  <i className="bi bi-calendar-check fs-1" style={{ color: 'var(--cpg-primary)', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-cpg p-3 h-100" style={{ borderLeft: '4px solid #64748b' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Demandes en attente</p>
                    <p className="fs-3 fw-bold mb-0" style={{ color: '#64748b' }}>{stats.demandesEnAttente}</p>
                  </div>
                  <i className="bi bi-hourglass-split fs-1" style={{ color: '#64748b', opacity: 0.3 }}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            {/* Panneau Pointage de l'équipe */}
            <div className="col-lg-6">
              <div className="card-cpg p-0 overflow-hidden h-100">
                <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--cpg-border)' }}>
                  <i className="bi bi-clock" style={{ color: 'var(--cpg-primary)' }}></i>
                  <span className="fw-bold">Pointage de l'équipe</span>
                </div>

                {equipe.length === 0 && (
                  <p className="text-muted text-center p-4 mb-0 small">Aucun employé dans votre service.</p>
                )}

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {equipe.map((emp) => {
                    const badge = badgeStatutPresence(emp.statut_presence);
                    return (
                      <div
                        key={emp.id}
                        className="d-flex justify-content-between align-items-center p-3 border-bottom"
                        style={{ borderColor: 'var(--cpg-border)' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: badge.couleur, flexShrink: 0,
                            }}
                          />
                          <span className="fw-semibold" style={{ fontSize: '14px' }}>
                            {emp.prenom} {emp.nom}
                          </span>
                        </div>
                        <div className="text-end">
                          <span style={{ fontSize: '12.5px', color: badge.couleur, fontWeight: 600 }}>
                            {badge.label}
                          </span>
                          {emp.heure_arrivee && (
                            <span className="text-muted d-block" style={{ fontSize: '11px' }}>
                              {emp.heure_arrivee.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panneau Demandes de congé */}
            <div className="col-lg-6">
              <div className="card-cpg p-0 overflow-hidden h-100">
                <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--cpg-border)' }}>
                  <i className="bi bi-airplane" style={{ color: 'var(--cpg-primary)' }}></i>
                  <span className="fw-bold">Demandes de congé</span>
                </div>

                {demandesConge.length === 0 && (
                  <p className="text-muted text-center p-4 mb-0 small">Aucune demande en attente.</p>
                )}

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {demandesConge.map((d) => (
                    <div
                      key={d.id}
                      className="d-flex justify-content-between align-items-center p-3 border-bottom"
                      style={{ borderColor: 'var(--cpg-border)' }}
                    >
                      <span className="fw-semibold" style={{ fontSize: '14px' }}>
                        {d.employe_prenom} {d.employe_nom}
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: '12.5px' }}>
                          {d.nb_jours} jour{d.nb_jours > 1 ? 's' : ''}
                        </span>
                        <span className="badge badge-cpg-warning">En attente</span>
                      </div>
                    </div>
                  ))}
                </div>

                {demandesConge.length > 0 && (
                  <div className="p-2 border-top text-center" style={{ borderColor: 'var(--cpg-border)' }}>
                    <a href="/chef/validation-conges" className="small fw-semibold" style={{ color: 'var(--cpg-primary)' }}>
                      Voir toutes les demandes →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </LayoutChef>
  );
}

export default DashboardChef;