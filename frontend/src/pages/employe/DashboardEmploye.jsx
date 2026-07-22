import { useAuth } from '../../context/AuthContext';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function DashboardEmploye() {
  const { utilisateur } = useAuth();

  return (
    <LayoutEmploye>
      <h2 className="fw-bold mb-1">Mon espace</h2>
      <p className="text-muted">Connecté en tant que : {utilisateur?.email}</p>

      <div className="row g-3 mt-2">
        <CarteAction to="/employe/mes-conges" titre="Mes congés" description="Voir mes demandes et leur statut" icone="bi-calendar-check" />
        <CarteAction to="/employe/mes-absences" titre="Mes absences" description="Voir ou déclarer une absence" icone="bi-calendar-x" />
        <CarteAction to="/employe/mes-presences" titre="Mes présences" description="Historique de pointage" icone="bi-clock-history" />
      </div>
    </LayoutEmploye>
  );
}

function CarteAction({ to, titre, description, icone }) {
  return (
    <div className="col-md-4">
      <a href={to} className="text-decoration-none text-dark">
        <div className="card card-cpg p-3 h-100">
          <i className={`bi ${icone} fs-2 mb-2`} style={{ color: 'var(--cpg-accent)' }}></i>
          <h5 className="mb-1">{titre}</h5>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </a>
    </div>
  );
}

export default DashboardEmploye;