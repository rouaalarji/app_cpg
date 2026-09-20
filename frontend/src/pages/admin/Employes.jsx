import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../../services/employeService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';
import { useAuth } from '../../context/AuthContext';
import AjouterEmployeModal from './AjouterEmploye';

const COULEURS_AVATAR = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const LABELS_ROLE = {
  EMPLOYE: 'Employé',
  CHEF: 'Chef de service',
  RH: 'Ressources Humaines',
  ADMIN: 'Administrateur',
};

const COULEURS_ROLE = {
  EMPLOYE: 'badge-cpg-neutral',
  CHEF: 'badge-cpg-neutral',
  RH: 'badge-cpg-warning',
  ADMIN: 'badge-cpg-danger',
};

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
  const [modalOuvert, setModalOuvert] = useState(false);
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.role === 'ADMIN';

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

  function handleAjoute(nomComplet) {
    setModalOuvert(false);
    setMessageSucces(`${nomComplet} a été ajouté avec succès.`);
    charger();
    setTimeout(() => setMessageSucces(''), 4000);
  }

  const employesFiltres = employes.filter((emp) =>
    `${emp.nom} ${emp.prenom} ${emp.matricule} ${emp.service_nom} ${emp.email} ${emp.role}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Employés</h2>
          <p className="text-muted mb-0">{employes.length} employé{employes.length > 1 ? 's' : ''} au total</p>
        </div>

        {estAdmin && (
          <button
            type="button"
            className="btn btn-cpg-primary d-flex align-items-center gap-1"
            onClick={() => setModalOuvert(true)}
          >
            <i className="bi bi-plus-lg"></i> Ajouter un employé
          </button>
        )}
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
                  <th>Email</th>
                  <th>Matricule</th>
                  <th>Service</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  {estAdmin && <th className="text-end">Actions</th>}
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
                    <td className="text-muted">{emp.email || '—'}</td>
                    <td className="text-muted">{emp.matricule}</td>
                    <td>{emp.service_nom || '—'}</td>
                    <td>
                      <span className={`badge ${COULEURS_ROLE[emp.role] || 'badge-cpg-neutral'}`}>
                        {LABELS_ROLE[emp.role] || emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.statut === 'ACTIF' ? 'badge-cpg-success' : 'badge-cpg-neutral'}`}>
                        {emp.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {estAdmin && (
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOuvert && (
        <AjouterEmployeModal
          onClose={() => setModalOuvert(false)}
          onSuccess={handleAjoute}
        />
      )}
    </LayoutAdmin>
  );
}

export default Employes;