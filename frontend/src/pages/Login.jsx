import { useState } from 'react';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import cpg_log from '../assets/cpg_log.png';
import '../../src/styles.css';

const DESTINATIONS = {
  EMPLOYE: '/employe/dashboard',
  CHEF: '/chef/dashboard',
  RH: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
};

function EyeIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficher, setAfficher] = useState(false);
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
      const message = err.response?.data?.message || 'Connexion impossible. Vérifiez vos identifiants et réessayez.';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="login-page">
      {/* Panneau de marque */}
      <aside className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo-chip">
            <img src={cpg_log} alt="Logo CPG" />
          </div>
          <div className="login-brand-text">
            <h1>Votre espace de travail CPG</h1>
          </div>
        </div>
      </aside>

      {/* Formulaire */}
      <main className="login-main">
        <div className="login-card">
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">Entrez vos identifiants pour accéder à votre espace.</p>

          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="login-field">
              <label htmlFor="login-email">Adresse e-mail</label>
              <input
                id="login-email"
                type="email"
                className="form-control login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@cpg.tn"
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="login-password">
                <input
                  id="login-password"
                  type={afficher ? 'text' : 'password'}
                  className="form-control login-input"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setAfficher((v) => !v)}
                  aria-label={afficher ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={afficher}
                >
                  <EyeIcon off={afficher} />
                </button>
              </div>
            </div>

            <div aria-live="polite">
              {erreur && (
                <div className="login-error" role="alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{erreur}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={chargement} className="btn btn-cpg-primary login-submit">
              {chargement ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                  Connexion en cours…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="login-register">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>

        <footer className="login-footer">© {new Date().getFullYear()} CPG. Tous droits réservés.</footer>
      </main>
    </div>
  );
}

export default Login;