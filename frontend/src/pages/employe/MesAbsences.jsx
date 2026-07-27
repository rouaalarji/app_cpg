import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesAbsences } from '../../services/absenceService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function MesAbsences() {
  const [absences, setAbsences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const data = await getMesAbsences();
        setAbsences(data);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <LayoutEmploye>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Mes absences</h2>
          <p className="text-muted mb-0">{absences.length} absence(s) déclarée(s)</p>
        </div>
        <Link to="/employe/mes-absences/declarer" className="btn btn-cpg-primary d-flex align-items-center gap-1">
          <i className="bi bi-plus-lg"></i> Déclarer une absence
        </Link>
      </div>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && absences.length === 0 && (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-x-circle fs-1 mb-2 d-block"></i>
            Aucune absence déclarée.
          </div>
        )}

        {!chargement && absences.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Dates</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((a) => (
                <tr key={a.id}>
                  <td>{a.date_debut} → {a.date_fin}</td>
                  <td>{a.motif || '—'}</td>
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
    </LayoutEmploye>
  );
}

export default MesAbsences;