import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

function Services() {
  const [services, setServices] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [chargement, setChargement] = useState(true);

  async function charger() {
    try {
      const [servicesRes, departementsRes] = await Promise.all([
        api.get('/services'),
        api.get('/departements'),
      ]);
      setServices(servicesRes.data);
      setDepartements(departementsRes.data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function nomDepartement(departementId) {
    const dep = departements.find((d) => d.id === departementId);
    return dep ? dep.nom : '—';
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Départements & Services</h2>
        <div>
        
          <Link to="/services/ajouter">
            <button style={{ padding: '8px 16px' }}>+ Service</button>
          </Link>
        </div>
      </div>

      {chargement && <p>Chargement...</p>}

      {!chargement && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom du service</th>
              <th>Département</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.code}</td>
                <td>{s.nom}</td>
                <td>{nomDepartement(s.departement_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!chargement && services.length === 0 && (
        <p style={{ marginTop: '12px', color: '#666' }}>
          Aucun service. Crée d'abord un département, puis un service.
        </p>
      )}
    </Layout>
  );
}

export default Services;