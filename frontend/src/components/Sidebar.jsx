import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cpg_log from '../assets/cpg_log.png';

function Sidebar({ ouvert, setOuvert }) {
  const { utilisateur, deconnecter } = useAuth();

  return (
    <div style={{
      width: ouvert ? '220px' : '64px',
      height: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: ouvert ? 'space-between' : 'center',
        marginBottom: '28px',
      }}>
        {ouvert && (
          <img src={cpg_log} alt="Logo CPG" style={{ height: '36px', objectFit: 'contain' }} />
        )}
        <button
          onClick={() => setOuvert(!ouvert)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          {ouvert ? '⟨' : '⟩'}
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
        <SidebarLink to="/dashboard" label="Dashboard" ouvert={ouvert} />
        <SidebarLink to="/employes" label="Employés" ouvert={ouvert} />
        <SidebarLink to="/mes-conges" label="Mes congés" ouvert={ouvert} />
        <SidebarLink to="/mes-presences" label="Mes présences" ouvert={ouvert} />
        <SidebarLink to="/validation-conges" label="Validation congés" ouvert={ouvert} />
        <SidebarLink to="/services" label="Départements / Services" ouvert={ouvert} />
        <SidebarLink to="/types-conge" label="Types de congés" ouvert={ouvert} />
      </nav>

      {utilisateur && (
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', fontSize: '13px' }}>
          {ouvert && (
            <p style={{ margin: '0 0 8px 0' }}>
              {utilisateur.email}<br />
              <span style={{ opacity: 0.6 }}>({utilisateur.role})</span>
            </p>
          )}
          <button
            onClick={deconnecter}
            style={{
              width: '100%',
              padding: '8px',
              background: '#1e293b',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {ouvert ? 'Déconnexion' : '⏻'}
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ to, label, ouvert }) {
  return (
    <Link
      to={to}
      style={{
        color: '#e2e8f0',
        textDecoration: 'none',
        padding: '10px 8px',
        borderRadius: '6px',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {ouvert ? label : label.charAt(0)}
    </Link>
  );
}

export default Sidebar;