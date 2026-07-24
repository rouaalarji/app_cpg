import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function Services() {
  const [services, setServices] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  async function charger() {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = services.filter((s) =>
    `${s.code} ${s.nom} ${s.departement_nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <LayoutAdmin>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">Services</h2>
          <p className="text-muted mb-0">{services.length} service(s)</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/departements" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-diagram-3"></i> Gérer les départements
          </Link>
          <Link to="/admin/services/ajouter" className="btn btn-cpg-primary d-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Ajouter un service
          </Link>
        </div>
      </div>

      <div className="card-cpg p-0 overflow-hidden">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Rechercher un service..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          </div>
        </div>

        {chargement && <p className="p-4 mb-0 text-muted">Chargement...</p>}

        {!chargement && filtres.length === 0 && (
          <div className="p-5 text-center text-muted">Aucun service trouvé.</div>
        )}

        {!chargement && filtres.length > 0 && (
          <table className="table table-cpg mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service</th>
                <th>Département</th>
                <th>Responsable</th>
                <th>Effectif</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((s) => (
                <tr key={s.id}>
                  <td className="text-muted">{s.code}</td>
                  <td className="fw-semibold">{s.nom}</td>
                  <td>
                    <span className="badge badge-cpg-neutral">{s.departement_nom}</span>
                  </td>
                  <td>{s.responsable_nom || <span className="text-muted">Non défini</span>}</td>
                  <td>
                    <span className="badge badge-cpg-success">{s.nb_employes} employé{s.nb_employes > 1 ? 's' : ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default Services;