import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DESTINATIONS = {
  EMPLOYE: '/employe/dashboard',
  CHEF: '/chef/dashboard',
  RH: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
};

function RoleRoute({ rolesAutorises, children }) {
  const { utilisateur } = useAuth();

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to={DESTINATIONS[utilisateur.role] || '/login'} replace />;
  }

  return children;
}

export default RoleRoute;