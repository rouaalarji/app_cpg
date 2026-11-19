import { useState, useEffect } from 'react';
import { getMonEquipe } from '../../services/employeService';
import LayoutChef from '../../components/layout/LayoutChef';
import Modal from '../../components/Modal';

const COULEURS_PRESENCE = {
  PRESENT: 'badge-cpg-success',
  ABSENT: 'badge-cpg-danger',
  RETARD: 'badge-cpg-warning',
};

const LABELS_PRESENCE = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'En retard',
};

const COULEURS_AVATAR = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

function couleurAvatar(nom) {
  const index = (nom?.charCodeAt(0) || 0) % COULEURS_AVATAR.length;
  return COULEURS_AVATAR[index];
}

function initiales(nom, prenom) {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
}

function formaterDate(valeur) {
  if (!valeur) return '—';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR');
}

function Info({ label, children }) {
  return (
    <div className="col-sm-6 mb-3">
      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.03em' }}>
        {label}
      </div>
      <div className="fw-medium">{children || '—'}</div>
    </div>
  );
}

function MonEquipe() {
  const [equipe, setEquipe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [employeSelectionne, setEmployeSelectionne] = useState(null);

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
    `${emp.nom} ${emp.prenom} ${emp.matricule}`.toLowerCase().includes(recherche.toLowerCase())
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
                <th>Statut aujourd'hui</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setEmployeSelectionne(emp)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEmployeSelectionne(emp);
                  }}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  title="Voir les informations"
                >
                  <td className="text-muted">{emp.matricule}</td>
                  <td className="fw-semibold">{emp.nom}</td>
                  <td>{emp.prenom}</td>
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

      {/* Modale : informations de l'employé sélectionné */}
      {employeSelectionne && (
        <Modal
          titre="Informations de l'employé"
          onFermer={() => setEmployeSelectionne(null)}
        >
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="avatar-initiales"
              style={{
                backgroundColor: couleurAvatar(employeSelectionne.nom),
                width: '56px',
                height: '56px',
                fontSize: '18px',
              }}
            >
              {initiales(employeSelectionne.nom, employeSelectionne.prenom)}
            </div>
            <div>
              <div className="fw-bold fs-5">
                {employeSelectionne.prenom} {employeSelectionne.nom}
              </div>
              <div className="text-muted small">Matricule : {employeSelectionne.matricule || '—'}</div>
            </div>
          </div>

          <div className="row">
            <Info label="Email">{employeSelectionne.email}</Info>
            <Info label="Service">{employeSelectionne.service_nom}</Info>
            <Info label="Date d'embauche">{formaterDate(employeSelectionne.date_embauche)}</Info>
            <Info label="Statut du compte">
              {employeSelectionne.statut
                ? employeSelectionne.statut === 'ACTIF'
                  ? 'Actif'
                  : 'Inactif'
                : null}
            </Info>
            <Info label="Présence aujourd'hui">
              {employeSelectionne.statut_presence ? (
                <span className={`badge ${COULEURS_PRESENCE[employeSelectionne.statut_presence]}`}>
                  {LABELS_PRESENCE[employeSelectionne.statut_presence] || employeSelectionne.statut_presence}
                </span>
              ) : (
                <span className="badge badge-cpg-neutral">Non pointé</span>
              )}
            </Info>
            <Info label="Heure d'arrivée">
              {employeSelectionne.heure_arrivee ? employeSelectionne.heure_arrivee.slice(0, 5) : null}
            </Info>
          </div>
        </Modal>
      )}
    </LayoutChef>
  );
}

export default MonEquipe;