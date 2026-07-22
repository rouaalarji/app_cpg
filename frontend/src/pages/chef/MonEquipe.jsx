import { useState, useEffect } from 'react';
import { getMonEquipe } from '../../services/employeService';
import LayoutChef from '../../components/layout/LayoutChef';

function MonEquipe() {
  const [equipe, setEquipe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

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

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-3">Mon équipe</h2>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && equipe.length === 0 && (
        <p className="text-muted">Aucun employé dans votre service.</p>
      )}

      {!chargement && equipe.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Poste</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {equipe.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.matricule}</td>
                  <td>{emp.nom}</td>
                  <td>{emp.prenom}</td>
                  <td>{emp.poste}</td>
                  <td>
                    <span className={`badge ${emp.statut === 'ACTIF' ? 'bg-success' : 'bg-secondary'}`}>
                      {emp.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutChef>
  );
}

export default MonEquipe;