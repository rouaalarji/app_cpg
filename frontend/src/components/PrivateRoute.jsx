// protège une route côté frontend — redirige vers /login si pas connecté
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { utilisateur } = useAuth();

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;