import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getByMois, create, remove } from '../../services/jourFerieService';
import Modal from '../../components/Modal';
import LayoutEmploye from '../../components/layout/LayoutEmploye';
import LayoutChef from '../../components/layout/LayoutChef';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const NOMS_MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const LABELS_TYPE = { FERIE: 'Férié', GREVE: 'Grève', AUTRE: 'Autre' };
const COULEURS_TYPE = { FERIE: '#dc2626', GREVE: '#d97706', AUTRE: '#6366f1' };

function CalendrierFeries() {
  const { utilisateur } = useAuth();
  const estRh = utilisateur?.role === 'RH';

  const LayoutSelon = utilisateur?.role === 'CHEF'
    ? LayoutChef
    : (utilisateur?.role === 'RH' || utilisateur?.role === 'ADMIN')
      ? LayoutAdmin
      : LayoutEmploye;

  const aujourdHui = new Date();
  const [annee, setAnnee] = useState(aujourdHui.getFullYear());
  const [mois, setMois] = useState(aujourdHui.getMonth() + 1);
  const [jours, setJours] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [dateSelectionnee, setDateSelectionnee] = useState(null);
  const [type, setType] = useState('FERIE');
  const [description, setDescription] = useState('');

  async function charger() {
    setChargement(true);
    try {
      const data = await getByMois(annee, mois);
      setJours(data);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, [annee, mois]);

  function moisPrecedent() {
    if (mois === 1) { setMois(12); setAnnee(annee - 1); } else { setMois(mois - 1); }
  }
  function moisSuivant() {
    if (mois === 12) { setMois(1); setAnnee(annee + 1); } else { setMois(mois + 1); }
  }

  const premierJourMois = new Date(annee, mois - 1, 1);
  let decalage = premierJourMois.getDay() - 1;
  if (decalage < 0) decalage = 6;
  const nbJoursMois = new Date(annee, mois, 0).getDate();

  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJoursMois; j++) cases.push(j);

  function jourFerieDe(j) {
    const dateStr = `${annee}-${String(mois).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    return jours.find((f) => f.date.split('T')[0] === dateStr);
  }

  function handleClicJour(j) {
    if (!j || !estRh) return; // lecture seule pour employé/chef
    const dateStr = `${annee}-${String(mois).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    const existant = jourFerieDe(j);
    if (existant) {
      if (window.confirm(`Retirer "${existant.description || LABELS_TYPE[existant.type]}" du ${dateStr} ?`)) {
        remove(existant.id).then(charger);
      }
    } else {
      setDateSelectionnee(dateStr);
      setType('FERIE');
      setDescription('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await create({ date: dateSelectionnee, type, description });
      setDateSelectionnee(null);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  }

  return (
    <LayoutSelon>
      <h2 className="fw-bold mb-1">Calendrier des jours non travaillés</h2>
      <p className="text-muted mb-4">
        {estRh ? 'Jours fériés, grèves — cliquez sur une date pour la marquer ou la retirer' : 'Jours fériés et grèves déclarés par les RH'}
      </p>

      <div className="card-cpg p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button onClick={moisPrecedent} className="btn btn-outline-secondary btn-sm"><i className="bi bi-chevron-left"></i></button>
          <h5 className="fw-bold mb-0">{NOMS_MOIS[mois - 1]} {annee}</h5>
          <button onClick={moisSuivant} className="btn btn-outline-secondary btn-sm"><i className="bi bi-chevron-right"></i></button>
        </div>

        {chargement ? (
          <p className="text-muted text-center py-4">Chargement...</p>
        ) : (
          <div className="row g-2">
            {JOURS_SEMAINE.map((j) => (
              <div key={j} className="col text-center text-muted small fw-semibold">{j}</div>
            ))}
            {cases.map((j, i) => {
              const ferie = j ? jourFerieDe(j) : null;
              return (
                <div key={i} className="col-auto" style={{ width: `${100 / 7}%` }}>
                  {j && (
                    <div
                      onClick={() => handleClicJour(j)}
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        aspectRatio: '1',
                        borderRadius: '10px',
                        cursor: estRh ? 'pointer' : 'default',
                        background: ferie ? `${COULEURS_TYPE[ferie.type]}15` : '#f8fafc',
                        border: ferie ? `1.5px solid ${COULEURS_TYPE[ferie.type]}` : '1px solid var(--cpg-border)',
                      }}
                    >
                      <span className="fw-semibold" style={{ fontSize: '14px', color: ferie ? COULEURS_TYPE[ferie.type] : 'var(--cpg-text)' }}>
                        {j}
                      </span>
                      {ferie && (
                        <span style={{ fontSize: '9px', color: COULEURS_TYPE[ferie.type] }}>{LABELS_TYPE[ferie.type]}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="d-flex gap-3 mt-4">
          {Object.entries(LABELS_TYPE).map(([k, v]) => (
            <div key={k} className="d-flex align-items-center gap-1">
              <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: COULEURS_TYPE[k] }}></span>
              <span className="small text-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {estRh && dateSelectionnee && (
        <Modal titre={`Marquer le ${dateSelectionnee}`} onFermer={() => setDateSelectionnee(null)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                <option value="FERIE">Férié</option>
                <option value="GREVE">Grève</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="ex: Fête de l'Indépendance"
              />
            </div>
            <button type="submit" className="btn btn-cpg-primary w-100">Enregistrer</button>
          </form>
        </Modal>
      )}
    </LayoutSelon>
  );
}

export default CalendrierFeries;