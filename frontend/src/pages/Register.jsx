import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

function Register() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('RH');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setSucces('');
    setChargement(true);

    try {
      await register(email, motDePasse, role);
      setSucces('Compte créé avec succès. Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la création du compte';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }}>
      <h2>Créer un compte - Gestion RH CPG</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="EMPLOYE">Employé</option>
            <option value="CHEF">Chef</option>
            <option value="RH">RH</option>
          </select>
        </div>

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
        {succes && <p style={{ color: 'green' }}>{succes}</p>}

        <button type="submit" disabled={chargement} style={{ width: '100%', padding: '10px' }}>
          {chargement ? 'Création...' : 'Créer le compte'}
        </button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default Register;