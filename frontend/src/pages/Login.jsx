import { useState } from 'react';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import cpg_log from '../assets/cpg_log.png';

const DESTINATIONS = {
  EMPLOYE: '/employe/dashboard',
  CHEF: '/chef/dashboard',
  RH: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
};

function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const { connecter } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const data = await login(email, motDePasse);
      connecter(data.token, data.utilisateur);
      navigate(DESTINATIONS[data.utilisateur.role] || '/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: 'var(--cpg-bg)' }}>
      <div className="card card-cpg p-4" style={{ width: '380px' }}>
        <div className="text-center mb-4">
          <img src={cpg_log} alt="Logo CPG" style={{ height: '56px', objectFit: 'contain' }} className="mb-3" />
          <h4 className="fw-bold" style={{ color: 'var(--cpg-primary)' }}>Gestion RH CPG</h4>
          <p className="text-muted small">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
          </div>

          {erreur && (
            <div className="alert alert-danger py-2 small" role="alert">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="btn btn-cpg-primary w-100 py-2"
          >
            {chargement ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          Pas encore de compte ? <Link to="/register" style={{ color: 'var(--cpg-accent)' }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;