import { useState, useEffect } from 'react';
import api from '../../services/api';
import LayoutChef from '../../components/layout/LayoutChef';

function ValidationCongesChef() {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const res = await api.get('/demandes-conge/mon-equipe');
      setDemandes(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleValider(id) {
    if (!window.confirm('Valider cette demande (1er niveau) ?')) return;
    try {
      await api.patch(`/demandes-conge/${id}/valider-chef`);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleRefuser(id) {
    const commentaire = window.prompt('Motif du refus :');
    if (!commentaire?.trim()) return alert('Motif obligatoire');
    try {
      await api.patch(`/demandes-conge/${id}/refuser`, { commentaire });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-3">Validation congés — Mon équipe</h2>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && demandes.length === 0 && <p className="text-muted">Aucune demande en attente.</p>}

      {!chargement && demandes.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Dates</th>
                <th>Nb jours</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td>{d.employe_prenom} {d.employe_nom}</td>
                  <td>{d.date_debut} → {d.date_fin}</td>
                  <td>{d.nb_jours}</td>
                  <td><span className="badge bg-warning text-dark">{d.statut}</span></td>
                  <td>
                    <button onClick={() => handleValider(d.id)} className="btn btn-sm btn-outline-success me-1">Valider</button>
                    <button onClick={() => handleRefuser(d.id)} className="btn btn-sm btn-outline-danger">Refuser</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutChef>
  );
}

export default ValidationCongesChef;