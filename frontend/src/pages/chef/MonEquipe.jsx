import { useState, useEffect } from 'react';
import { getMonEquipe } from '../../services/employeService';
import LayoutChef from '../../components/layout/LayoutChef';

const LABELS_ZONE = {
  ADMINISTRATIF: 'Administratif',
  TERRAIN: 'Terrain',
  ATELIER: 'Atelier',
  MAGASIN: 'Magasin',
  LABORATOIRE: 'Laboratoire',
};

const COULEURS_PRESENCE = {
  PRESENT: 'badge-cpg-success',
  ABSENT: 'badge-cpg-danger',
  RETARD: 'badge-cpg-warning',
};

function MonEquipe() {
  const [equipe, setEquipe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const data = await getMonEquipe();
        setEquipe(data);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  const filtres = equipe.filter((emp) =>
    `${emp.nom} ${emp.prenom} ${emp.matricule} ${emp.poste}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-1">Mon équipe</h2>
      <p className="text-muted mb-4">{equipe.length} employé(s) dans mon service</p>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Rechercher un employé..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}
        {!chargement && filtres.length === 0 && <div className="p-5 text-center text-muted">Aucun employé trouvé.</div>}

        {!chargement && filtres.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Poste</th>
                <th>Zone de travail</th>
                <th>Statut aujourd'hui</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((emp) => (
                <tr key={emp.id}>
                  <td className="text-muted">{emp.matricule}</td>
                  <td className="fw-semibold">{emp.nom}</td>
                  <td>{emp.prenom}</td>
                  <td>{emp.poste}</td>
                  <td>
                    <span className="badge badge-cpg-neutral">{LABELS_ZONE[emp.zone_travail] || emp.zone_travail}</span>
                  </td>
                  <td>
                    {emp.statut_presence ? (
                      <span className={`badge ${COULEURS_PRESENCE[emp.statut_presence]}`}>
                        {emp.statut_presence}
                        {emp.heure_arrivee && ` (${emp.heure_arrivee.slice(0, 5)})`}
                      </span>
                    ) : (
                      <span className="badge badge-cpg-neutral">Non pointé</span>
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

export default MonEquipe;