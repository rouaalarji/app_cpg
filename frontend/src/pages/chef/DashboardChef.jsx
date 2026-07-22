import { useAuth } from '../../context/AuthContext';
import LayoutChef from '../../components/layout/LayoutChef';

function DashboardChef() {
  const { utilisateur } = useAuth();

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-1">Tableau de bord Chef</h2>
      <p className="text-muted">Connecté en tant que : {utilisateur?.email}</p>
    </LayoutChef>
  );
}

export default DashboardChef;