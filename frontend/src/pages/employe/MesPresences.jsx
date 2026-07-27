import { useState, useEffect } from 'react';
import { getMesPresences } from '../../services/presenceService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function aujourdHuiStr() {
  return new Date().toISOString().split('T')[0];
}

function MesPresences() {
  const [presences, setPresences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const data = await getMesPresences();
        setPresences(data);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  const presenceDuJour = presences.find((p) => p.date === aujourdHuiStr());

  return (
    <LayoutEmploye>
      <h2 className="fw-bold mb-1">Mes présences</h2>
      <p className="text-muted mb-4">Consultation de votre historique de pointage</p>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {/* Statut du jour */}
      <div className="card-cpg p-4 mb-4">
        <h6 className="fw-bold mb-3">Aujourd'hui — {aujourdHuiStr()}</h6>
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div>
            <p className="text-muted small mb-1">Arrivée</p>
            <p className="fs-5 fw-bold mb-0">{presenceDuJour?.heure_arrivee || '—'}</p>
          </div>
          <div>
            <p className="text-muted small mb-1">Départ</p>
            <p className="fs-5 fw-bold mb-0">{presenceDuJour?.heure_depart || '—'}</p>
          </div>
          <div>
            <p className="text-muted small mb-1">Statut</p>
            <span className={`badge ${presenceDuJour?.statut === 'PRESENT' ? 'badge-cpg-success' : presenceDuJour?.statut === 'ABSENT' ? 'badge-cpg-danger' : 'badge-cpg-neutral'}`}>
              {presenceDuJour?.statut || 'Non pointé'}
            </span>
          </div>
        </div>
        <p className="text-muted small mt-3 mb-0">
          <i className="bi bi-info-circle me-1"></i>
          Le pointage est effectué par votre chef de service.
        </p>
      </div>

      {/* Historique */}
      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <h6 className="fw-bold mb-0">Historique</h6>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && presences.length === 0 && (
          <div className="p-5 text-center text-muted">Aucun historique de présence.</div>
        )}

        {!chargement && presences.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {presences.map((p) => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.heure_arrivee || '—'}</td>
                  <td>{p.heure_depart || '—'}</td>
                  <td>
                    <span className={`badge ${p.statut === 'PRESENT' ? 'badge-cpg-success' : p.statut === 'ABSENT' ? 'badge-cpg-danger' : 'badge-cpg-warning'}`}>
                      {p.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutEmploye>
  );
}

export default MesPresences;