import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../../services/employeService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const COULEURS_AVATAR = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

function couleurAvatar(nom) {
  const index = nom.charCodeAt(0) % COULEURS_AVATAR.length;
  return COULEURS_AVATAR[index];
}

function initiales(nom, prenom) {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
}

function Employes() {
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [recherche, setRecherche] = useState('');

  async function charger() {
    try {
      const data = await getAll();
      setEmployes(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSupprimer(id, nomComplet) {
    if (!window.confirm(`Supprimer l'employé ${nomComplet} ? Cette action est irréversible.`)) return;
    try {
      await remove(id);
      setMessageSucces(`${nomComplet} a été supprimé avec succès.`);
      charger();
      setTimeout(() => setMessageSucces(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  const employesFiltres = employes.filter((emp) =>
    `${emp.nom} ${emp.prenom} ${emp.matricule} ${emp.service_nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Employés</h2>
          <p className="text-muted mb-0">{employes.length} employé{employes.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/admin/employes/ajouter" className="btn btn-cpg-primary d-flex align-items-center gap-1">
          <i className="bi bi-plus-lg"></i> Ajouter un employé
        </Link>
      </div>

      {messageSucces && (
        <div className="alert d-flex align-items-center gap-2 mb-3" style={{ background: 'var(--cpg-success-light)', color: '#047857', border: 'none', borderRadius: '10px' }}>
          <i className="bi bi-check-circle-fill"></i> {messageSucces}
        </div>
      )}
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

        {!chargement && employesFiltres.length === 0 && (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-people fs-1 mb-2 d-block"></i>
            Aucun employé trouvé.
          </div>
        )}

        {!chargement && employesFiltres.length > 0 && (
          <div className="table-responsive">
            <table className="table table-cpg mb-0">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Matricule</th>
                  <th>Service</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employesFiltres.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="avatar-initiales"
                          style={{ backgroundColor: couleurAvatar(emp.nom) }}
                        >
                          {initiales(emp.nom, emp.prenom)}
                        </div>
                        <div>
                          <div className="fw-semibold">{emp.prenom} {emp.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{emp.matricule}</td>
                    <td>{emp.service_nom || '—'}</td>
                    <td>
                      <span className={`badge ${emp.statut === 'ACTIF' ? 'badge-cpg-success' : 'badge-cpg-neutral'}`}>
                        {emp.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/employes/modifier/${emp.id}`} className="btn btn-sm btn-light me-1" title="Modifier">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button
                        onClick={() => handleSupprimer(emp.id, `${emp.prenom} ${emp.nom}`)}
                        className="btn btn-sm btn-light text-danger"
                        title="Supprimer"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default Employes;