import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatsChef } from '../../services/dashboardService';
import LayoutChef from '../../components/layout/LayoutChef';

function DashboardChef() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const data = await getStatsChef();
        setStats(data);
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
        <div className="row g-3">
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
      )}
    </LayoutChef>
  );
}

export default DashboardChef;