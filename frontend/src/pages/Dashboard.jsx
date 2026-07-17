import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
  const { utilisateur } = useAuth();

  return (
    <Layout>
      <h2>Tableau de bord</h2>
      <p>Connecté en tant que : {utilisateur?.email} ({utilisateur?.role})</p>
    </Layout>
  );
}

export default Dashboard;