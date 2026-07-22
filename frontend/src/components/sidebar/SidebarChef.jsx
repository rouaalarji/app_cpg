import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cpg_log from '../../assets/cpg_log.png';

function SidebarChef({ ouvert, setOuvert }) {
  const { utilisateur, deconnecter } = useAuth();
  const location = useLocation();

  const liens = [
    { to: '/chef/dashboard', label: 'Dashboard', icone: 'bi-speedometer2' },
    { to: '/chef/mon-equipe', label: 'Mon équipe', icone: 'bi-people' },
    { to: '/chef/presences-equipe', label: 'Présences équipe', icone: 'bi-clock-history' },
    { to: '/chef/validation-conges', label: 'Validation congés', icone: 'bi-check2-square' },
    { to: '/chef/mes-conges', label: 'Mes congés (perso)', icone: 'bi-calendar-check' },
  ];

  return (
    <div
      className="d-flex flex-column position-fixed top-0 start-0 vh-100 text-white"
      style={{
        width: ouvert ? '240px' : '70px',
        backgroundColor: 'var(--cpg-accent)',
        transition: 'width 0.2s ease',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <div className={`d-flex align-items-center p-3 ${ouvert ? 'justify-content-between' : 'justify-content-center'}`}>
        {ouvert && <img src={cpg_log} alt="Logo CPG" style={{ height: '34px', objectFit: 'contain' }} />}
        <button onClick={() => setOuvert(!ouvert)} className="btn btn-sm text-white border-0">
          <i className={`bi ${ouvert ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </div>

      {ouvert && (
        <div className="px-3 mb-2">
          <span className="badge bg-light text-dark">Espace Chef de service</span>
        </div>
      )}

      <nav className="flex-grow-1 px-2">
        {liens.map((lien) => (
          <Link
            key={lien.to}
            to={lien.to}
            className={`d-flex align-items-center gap-2 text-decoration-none text-white rounded px-2 py-2 mb-1 ${
              location.pathname === lien.to ? 'bg-white bg-opacity-25' : ''
            }`}
            onMouseEnter={(e) => { if (location.pathname !== lien.to) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { if (location.pathname !== lien.to) e.currentTarget.style.background = 'transparent'; }}
          >
            <i className={`bi ${lien.icone} fs-5`}></i>
            {ouvert && <span className="text-nowrap">{lien.label}</span>}
          </Link>
        ))}
      </nav>

      {utilisateur && (
        <div className="border-top border-light p-3">
          {ouvert && (
            <div className="mb-2 small">
              <div className="text-truncate">{utilisateur.email}</div>
              <span className="badge bg-secondary">{utilisateur.role}</span>
            </div>
          )}
          <button onClick={deconnecter} className="btn btn-sm btn-outline-light w-100">
            <i className="bi bi-box-arrow-right"></i>
            {ouvert && <span className="ms-2">Déconnexion</span>}
          </button>
        </div>
      )}
    </div>
  );
}

export default SidebarChef;