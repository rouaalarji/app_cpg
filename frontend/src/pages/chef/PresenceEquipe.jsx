import { useState, useEffect } from 'react';
import { getMonEquipe } from '../../services/employeService';
import { getByEmploye, marquerPresence } from '../../services/presenceService';
import LayoutChef from '../../components/layout/LayoutChef';

function aujourdHui() {
  return new Date().toISOString().split('T')[0];
}

function PresenceEquipe() {
  const [equipe, setEquipe] = useState([]);
  const [presencesDuJour, setPresencesDuJour] = useState({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const membres = await getMonEquipe();
      setEquipe(membres);

      const today = aujourdHui();
      const map = {};
      for (const membre of membres) {
        const historique = await getByEmploye(membre.id);
        const duJour = historique.find((p) => p.date.split('T')[0] === today);
        if (duJour) map[membre.id] = duJour;
      }
      setPresencesDuJour(map);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleMarquerArrivee(employeId) {
    const heure = new Date().toTimeString().split(' ')[0];
    try {
      await marquerPresence({ employeId, date: aujourdHui(), heureArrivee: heure, statut: 'PRESENT' });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleMarquerDepart(employeId) {
    const heure = new Date().toTimeString().split(' ')[0];
    const presenceExistante = presencesDuJour[employeId];
    try {
      await marquerPresence({
        employeId,
        date: aujourdHui(),
        heureArrivee: presenceExistante?.heure_arrivee || null,
        heureDepart: heure,
        statut: presenceExistante?.statut || 'PRESENT',
      });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  async function handleMarquerAbsent(employeId) {
    try {
      await marquerPresence({ employeId, date: aujourdHui(), statut: 'ABSENT' });
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  return (
    <LayoutChef>
      <h2 className="fw-bold mb-3">Présences de mon équipe — {aujourdHui()}</h2>

      {chargement && <p>Chargement...</p>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {!chargement && equipe.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white card-cpg">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipe.map((emp) => {
                const presence = presencesDuJour[emp.id];
                return (
                  <tr key={emp.id}>
                    <td>{emp.prenom} {emp.nom}</td>
                    <td>{presence?.heure_arrivee || '—'}</td>
                    <td>{presence?.heure_depart || '—'}</td>
                    <td>
                      <span className={`badge ${presence?.statut === 'PRESENT' ? 'bg-success' : presence?.statut === 'ABSENT' ? 'bg-danger' : 'bg-secondary'}`}>
                        {presence?.statut || 'Non pointé'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleMarquerArrivee(emp.id)} className="btn btn-sm btn-outline-success me-1">Arrivée</button>
                      <button onClick={() => handleMarquerDepart(emp.id)} className="btn btn-sm btn-outline-primary me-1">Départ</button>
                      <button onClick={() => handleMarquerAbsent(emp.id)} className="btn btn-sm btn-outline-danger">Absent</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </LayoutChef>
  );
}

export default PresenceEquipe;