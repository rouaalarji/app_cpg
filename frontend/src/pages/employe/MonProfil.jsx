import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMonProfil } from '../../services/employeService';
import { changerMotDePasse } from '../../services/authService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';
import LayoutChef from '../../components/layout/LayoutChef';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function MonProfil() {
  const { utilisateur } = useAuth();

  const LayoutSelon = utilisateur?.role === 'CHEF'
    ? LayoutChef
    : (utilisateur?.role === 'RH' || utilisateur?.role === 'ADMIN')
      ? LayoutAdmin
      : LayoutEmploye;

  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [afficherFormMdp, setAfficherFormMdp] = useState(false);
  const [mdpForm, setMdpForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [erreurMdp, setErreurMdp] = useState('');
  const [succesMdp, setSuccesMdp] = useState('');
  const [chargementMdp, setChargementMdp] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const data = await getMonProfil();
        setProfil(data);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Impossible de charger le profil');
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  async function handleChangerMdp(e) {
    e.preventDefault();
    setErreurMdp('');
    setSuccesMdp('');

    if (mdpForm.nouveau !== mdpForm.confirmation) {
      setErreurMdp('La confirmation ne correspond pas au nouveau mot de passe');
      return;
    }

    setChargementMdp(true);
    try {
      await changerMotDePasse(mdpForm.ancien, mdpForm.nouveau);
      setSuccesMdp('Mot de passe modifié avec succès.');
      setMdpForm({ ancien: '', nouveau: '', confirmation: '' });
      setTimeout(() => {
        setSuccesMdp('');
        setAfficherFormMdp(false);
      }, 2000);
    } catch (err) {
      setErreurMdp(err.response?.data?.message || 'Erreur');
    } finally {
      setChargementMdp(false);
    }
  }

  if (chargement) {
    return (
      <LayoutSelon>
        <p>Chargement...</p>
      </LayoutSelon>
    );
  }

  if (erreur && !profil) {
    return (
      <LayoutSelon>
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {erreur} — aucune fiche employé n'est associée à ce compte.
        </div>
      </LayoutSelon>
    );
  }

  return (
    <LayoutSelon>
      <h2 className="fw-bold mb-1">Mon profil</h2>
      <p className="text-muted mb-4">Informations personnelles et professionnelles</p>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card-cpg p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                style={{ width: '64px', height: '64px', background: 'var(--cpg-primary)', fontSize: '22px' }}
              >
                {profil?.prenom?.charAt(0)}{profil?.nom?.charAt(0)}
              </div>
              <div>
                <h4 className="fw-bold mb-0">{profil?.prenom} {profil?.nom}</h4>
                <p className="text-muted mb-0">{profil?.matricule}</p>
              </div>
            </div>

            <table className="table table-borderless mb-0" style={{ fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td className="text-muted py-2" style={{ width: '160px' }}>Matricule</td>
                  <td className="fw-semibold py-2">{profil?.matricule}</td>
                </tr>
                <tr>
                  <td className="text-muted py-2">Email</td>
                  <td className="fw-semibold py-2">{profil?.email}</td>
                </tr>
                <tr>
                  <td className="text-muted py-2">Rôle</td>
                  <td className="py-2"><span className="badge badge-cpg-neutral">{profil?.role}</span></td>
                </tr>
                <tr>
                  <td className="text-muted py-2">Département</td>
                  <td className="fw-semibold py-2">{profil?.departement_nom}</td>
                </tr>
                <tr>
                  <td className="text-muted py-2">Service</td>
                  <td className="fw-semibold py-2">{profil?.service_code} — {profil?.service_nom}</td>
                </tr>
                <tr>
                  <td className="text-muted py-2">Date d'embauche</td>
                  <td className="fw-semibold py-2">{profil?.date_embauche}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-cpg p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-shield-lock me-2"></i>Sécurité
            </h6>

            {!afficherFormMdp && (
              <button onClick={() => setAfficherFormMdp(true)} className="btn btn-outline-secondary w-100">
                Changer mon mot de passe
              </button>
            )}

            {afficherFormMdp && (
              <form onSubmit={handleChangerMdp}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Ancien mot de passe</label>
                  <input
                    type="password"
                    value={mdpForm.ancien}
                    onChange={(e) => setMdpForm({ ...mdpForm, ancien: e.target.value })}
                    required
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={mdpForm.nouveau}
                    onChange={(e) => setMdpForm({ ...mdpForm, nouveau: e.target.value })}
                    required
                    minLength={6}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Confirmer</label>
                  <input
                    type="password"
                    value={mdpForm.confirmation}
                    onChange={(e) => setMdpForm({ ...mdpForm, confirmation: e.target.value })}
                    required
                    className="form-control form-control-sm"
                  />
                </div>

                {erreurMdp && <div className="alert alert-danger py-2 small">{erreurMdp}</div>}
                {succesMdp && <div className="alert alert-success py-2 small">{succesMdp}</div>}

                <div className="d-flex gap-2">
                  <button type="submit" disabled={chargementMdp} className="btn btn-cpg-primary btn-sm flex-grow-1">
                    {chargementMdp ? 'Envoi...' : 'Confirmer'}
                  </button>
                  <button type="button" onClick={() => setAfficherFormMdp(false)} className="btn btn-outline-secondary btn-sm">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </LayoutSelon>
  );
}

export default MonProfil;