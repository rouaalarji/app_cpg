import { useState, useEffect } from 'react';
import { getProchains } from '../services/jourFerieService';

const LABELS_TYPE = { FERIE: 'Jour férié', GREVE: 'Grève', AUTRE: 'Jour non travaillé' };

function aujourdHuiStr() {
  return new Date().toISOString().split('T')[0];
}

function BandeauJourFerie() {
  const [prochains, setProchains] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getProchains()
      .then(setProchains)
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return null;

  const today = aujourdHuiStr();
  const ferieAujourdhui = prochains.find((f) => f.date.split('T')[0] === today);
  const prochainsAVenir = prochains.filter((f) => f.date.split('T')[0] !== today);

  if (!ferieAujourdhui && prochainsAVenir.length === 0) return null;

  return (
    <div className="mb-4">
      {ferieAujourdhui && (
        <div
          className="d-flex align-items-center gap-2 p-3 mb-2"
          style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '12px' }}
        >
          <i className="bi bi-calendar-x fs-5"></i>
          <span className="fw-semibold">
            Aujourd'hui : {LABELS_TYPE[ferieAujourdhui.type]}{ferieAujourdhui.description ? ` — ${ferieAujourdhui.description}` : ''}
          </span>
        </div>
      )}

      {prochainsAVenir.length > 0 && (
        <div
          className="p-3"
          style={{ background: '#fff', border: '1px solid var(--cpg-border)', borderRadius: '12px' }}
        >
          <p className="text-uppercase small fw-semibold text-muted mb-2" style={{ letterSpacing: '0.06em' }}>
            Prochains jours non travaillés
          </p>
          {prochainsAVenir.slice(0, 3).map((f) => (
            <div key={f.id} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '13.5px' }}>
              <span
                className="badge"
                style={{
                  background: f.type === 'FERIE' ? '#fee2e2' : f.type === 'GREVE' ? '#fef3c7' : '#e0e7ff',
                  color: f.type === 'FERIE' ? '#991b1b' : f.type === 'GREVE' ? '#92400e' : '#4338ca',
                }}
              >
                {LABELS_TYPE[f.type]}
              </span>
              <span className="fw-semibold">{new Date(f.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
              {f.description && <span className="text-muted">— {f.description}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BandeauJourFerie;