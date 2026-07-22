import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStats } from '../../services/dashboardService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function DashboardAdmin() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur chargement stats', err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <LayoutAdmin>
      <h2 className="fw-bold mb-1">Tableau de bord {utilisateur?.role === 'RH' ? 'RH' : 'Administrateur'}</h2>
      <p className="text-muted">Connecté en tant que : {utilisateur?.email}</p>

      {chargement && <p>Chargement des statistiques...</p>}

      {!chargement && stats && (
        <div className="row g-3 mt-2">
          <CarteStat titre="Employés actifs" valeur={stats.totalEmployes} couleur="#1e40af" icone="bi-people" />
          <CarteStat titre="Demandes en attente" valeur={stats.demandesEnAttente} couleur="#d97706" icone="bi-hourglass-split" />
          <CarteStat titre="Services" valeur={stats.totalServices} couleur="#16a34a" icone="bi-diagram-3" />
          <CarteStat titre="Absences non justifiées" valeur={stats.absencesNonJustifiees} couleur="#dc2626" icone="bi-calendar-x" />
        </div>
      )}

      <h5 className="fw-bold mt-4 mb-3">Accès rapides</h5>
      <div className="row g-3">
        <CarteAction to="/admin/validation-conges" titre="Validation congés" description="Voir et traiter les demandes" icone="bi-check2-square" />
        {utilisateur?.role === 'RH' && (
          <>
            <CarteAction to="/admin/employes" titre="Employés" description="Gérer les fiches employés" icone="bi-person-badge" />
            <CarteAction to="/admin/services" titre="Services" description="Gérer départements et services" icone="bi-diagram-3" />
          </>
        )}
        {utilisateur?.role === 'ADMIN' && (
          <CarteAction to="/admin/comptes" titre="Gestion des comptes" description="Créer et gérer les utilisateurs" icone="bi-shield-lock" />
        )}
      </div>
    </LayoutAdmin>
  );
}

function CarteStat({ titre, valeur, couleur, icone }) {
  return (
    <div className="col-md-3">
      <div className="card card-cpg p-3 h-100" style={{ borderLeft: `4px solid ${couleur}` }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted small mb-1">{titre}</p>
            <p className="fs-3 fw-bold mb-0" style={{ color: couleur }}>{valeur}</p>
          </div>
          <i className={`bi ${icone} fs-1`} style={{ color: couleur, opacity: 0.3 }}></i>
        </div>
      </div>
    </div>
  );
}

function CarteAction({ to, titre, description, icone }) {
  return (
    <div className="col-md-4">
      <Link to={to} className="text-decoration-none text-dark">
        <div className="card card-cpg p-3 h-100">
          <i className={`bi ${icone} fs-2 mb-2`} style={{ color: 'var(--cpg-accent)' }}></i>
          <h6 className="mb-1">{titre}</h6>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default DashboardAdmin;