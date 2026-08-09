import { useState, useEffect } from 'react';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const LABELS_ROLE = {
  EMPLOYE: 'Employé',
  CHEF: 'Chef',
  RH: 'RH',
  ADMIN: 'Admin',
};

function GestionComptes() {
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

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

  async function handleToggleActif(id, actifActuel, email) {
    const action = actifActuel ? 'désactiver' : 'activer';
    if (!window.confirm(`Voulez-vous ${action} le compte ${email} ?`)) return;
    try {
      await api.patch(`/utilisateurs/${id}/statut`, { actif: !actifActuel });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  const filtres = comptes.filter((c) => c.email.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-1">Gestion des comptes</h2>
      <p className="text-muted mb-4">{comptes.length} compte(s) au total</p>

      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Rechercher par email..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Fiche employé</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((c) => (
                <tr key={c.id}>
                  <td className="fw-semibold">{c.email}</td>
                  <td><span className="badge badge-cpg-neutral">{LABELS_ROLE[c.role] || c.role}</span></td>
                  <td>
                    {c.employe_id ? (
                      <span className="badge badge-cpg-success">Liée</span>
                    ) : (
                      <span className="badge badge-cpg-warning">Aucune (orphelin)</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${c.actif ? 'badge-cpg-success' : 'badge-cpg-neutral'}`}>
                      {c.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button onClick={() => handleToggleActif(c.id, c.actif, c.email)} className="btn btn-sm btn-outline-secondary">
                      {c.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default GestionComptes;