import { useNavigate, useLocation } from 'react-router-dom';

const PAGES_DASHBOARD = ['/employe/dashboard', '/chef/dashboard', '/admin/dashboard'];

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pas de bouton retour sur les pages d'accueil (rien à "retourner")
  if (PAGES_DASHBOARD.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="btn btn-sm d-flex align-items-center gap-1 mb-3"
      style={{
        border: '1px solid var(--cpg-border)',
        borderRadius: '8px',
        color: 'var(--cpg-text)',
        background: '#fff',
        width: 'fit-content',
      }}
    >
      <i className="bi bi-arrow-left"></i> Retour
    </button>
  );
}

export default BackButton;