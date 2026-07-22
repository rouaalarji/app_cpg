import { useState, useEffect } from 'react';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function GestionComptes() {
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);

  async function charger() {
    try {
      const res = await api.get('/utilisateurs');
      setComptes(res.data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleChangerRole(id, nouveauRole) {
    try {
      await api.patch(`/utilisateurs/${id}/role`, { role: nouveauRole });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleToggleActif(id, actifActuel) {
    try {
      await api.patch(`/utilisateurs/${id}/statut`, { actif: !actifActuel });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-3">Gestion des comptes</h2>

      {chargement && <p>Chargement...</p>}

      {!chargement && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((c) => (
                <tr key={c.id}>
                  <td>{c.email}</td>
                  <td>
                    <select
                      value={c.role}
                      onChange={(e) => handleChangerRole(c.id, e.target.value)}
                      className="form-select form-select-sm"
                      style={{ width: '150px' }}
                    >
                      <option value="EMPLOYE">Employé</option>
                      <option value="CHEF">Chef</option>
                      <option value="RH">RH</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${c.actif ? 'bg-success' : 'bg-secondary'}`}>
                      {c.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleToggleActif(c.id, c.actif)} className="btn btn-sm btn-outline-secondary">
                      {c.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutAdmin>
  );
}

export default GestionComptes;