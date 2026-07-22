import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../../services/employeService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
function Employes() {
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const data = await getAll();
      setEmployes(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSupprimer(id) {
    if (!window.confirm('Supprimer cet employé ?')) return;
    try {
      await remove(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  return (
    <LayoutAdmin>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Liste des employés</h2>
        <Link to="/employes/ajouter">
          <button style={{ padding: '8px 16px' }}>+ Ajouter un employé</button>
        </Link>
      </div>

      {chargement && <p>Chargement...</p>}
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

      {!chargement && !erreur && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Poste</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employes.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.matricule}</td>
                <td>{emp.nom}</td>
                <td>{emp.prenom}</td>
                <td>{emp.poste}</td>
                <td>{emp.statut}</td>
                <td>
                  <Link to={`/employes/modifier/${emp.id}`}>Modifier</Link>
                  {' | '}
                  <button onClick={() => handleSupprimer(emp.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </LayoutAdmin>
  );
}

export default Employes;