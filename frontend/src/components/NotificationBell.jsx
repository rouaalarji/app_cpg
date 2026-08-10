import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesNotifications, marquerLue, marquerToutesLues } from '../services/notificationService';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  async function charger() {
    try {
      const data = await getMesNotifications();
      setNotifications(data.notifications);
      setNonLues(data.nonLues);
    } catch (err) {
      // silencieux
    }
  }

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 30000); // rafraîchit toutes les 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleClicNotification(notif) {
    if (!notif.lue) {
      await marquerLue(notif.id);
      charger();
    }
    setOuvert(false);
    if (notif.lien) navigate(notif.lien);
  }

  async function handleToutesLues() {
    await marquerToutesLues();
    charger();
  }

  return (
    <div className="position-relative" ref={ref}>
      <button
        onClick={() => setOuvert(!ouvert)}
        className="btn btn-sm text-white border-0 position-relative"
      >
        <i className="bi bi-bell fs-5"></i>
        {nonLues > 0 && (
          <span
            className="position-absolute badge rounded-pill bg-danger"
            style={{ top: '-2px', right: '-2px', fontSize: '10px', padding: '3px 5px' }}
          >
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div
          className="position-absolute bg-white shadow-lg"
          style={{
            top: '110%',
            left: 0,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            borderRadius: '12px',
            border: '1px solid var(--cpg-border)',
            zIndex: 2000,
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'var(--cpg-border)' }}>
            <span className="fw-bold" style={{ color: 'var(--cpg-text)' }}>Notifications</span>
            {nonLues > 0 && (
              <button onClick={handleToutesLues} className="btn btn-sm p-0" style={{ fontSize: '12px', color: 'var(--cpg-primary)' }}>
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="text-muted text-center p-4 mb-0 small">Aucune notification.</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClicNotification(n)}
              className="p-3 border-bottom"
              style={{
                borderColor: 'var(--cpg-border)',
                cursor: 'pointer',
                background: n.lue ? '#fff' : 'var(--cpg-primary-light)',
              }}
            >
              <p className="fw-semibold mb-1" style={{ color: 'var(--cpg-text)', fontSize: '13.5px' }}>{n.titre}</p>
              <p className="text-muted mb-1" style={{ fontSize: '12.5px' }}>{n.message}</p>
              <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                {new Date(n.date_creation).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;