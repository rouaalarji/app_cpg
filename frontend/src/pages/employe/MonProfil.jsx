import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMonProfil } from '../../services/employeService';
import { changerMotDePasse } from '../../services/authService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';
import LayoutChef from '../../components/layout/LayoutChef';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

const LABELS_ROLE = {
  EMPLOYE: 'Employé',
  CHEF: 'Chef de service',
  RH: 'Ressources Humaines',
  ADMIN: 'Administrateur',
};

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
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="spinner-border" style={{ color: 'var(--cpg-primary)' }} role="status"></div>
        </div>
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

  const champs = [
    { icone: 'bi-hash', label: 'Matricule', valeur: profil?.matricule },
    { icone: 'bi-envelope', label: 'Adresse email', valeur: profil?.email },
    { icone: 'bi-diagram-3', label: 'Département', valeur: profil?.departement_nom },
    { icone: 'bi-buildings', label: 'Service', valeur: `${profil?.service_code || ''} — ${profil?.service_nom || ''}` },
    { icone: 'bi-calendar-event', label: "Date d'embauche", valeur: profil?.date_embauche },
    { icone: 'bi-briefcase', label: 'Statut', valeur: LABELS_ROLE[profil?.role] || profil?.role },
  ];

  return (
    <LayoutSelon>
      <div className="mb-4">
        <p className="text-uppercase small fw-semibold mb-1" style={{ color: 'var(--cpg-accent)', letterSpacing: '0.08em' }}>
          Espace personnel
        </p>
        <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>Mon profil</h2>
      </div>

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          <div
            className="overflow-hidden"
            style={{
              borderRadius: '16px',
              border: '1px solid var(--cpg-border)',
              background: '#fff',
            }}
          >
            {/* Bannière avec motif subtil */}
           
  
            <div className="px-4 px-md-5 pb-5">
              <div className="d-flex flex-column align-items-start">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                  style={{
                    width: '96px',
                    height: '96px',
                    marginTop: '-48px',
                    background: 'linear-gradient(135deg, var(--cpg-primary), var(--cpg-accent))',
                    fontSize: '30px',
                    border: '5px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  }}
                >
                  {profil?.prenom?.charAt(0)}{profil?.nom?.charAt(0)}
                </div>
                <div className="mt-3">
                  <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.01em' }}>
                    {profil?.prenom} {profil?.nom}
                  </h3>
                  <span
                    className="d-inline-flex align-items-center gap-1 px-3 py-1"
                    style={{
                      background: 'var(--cpg-primary-light)',
                      color: 'var(--cpg-primary)',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <i className="bi bi-patch-check-fill"></i>
                    {LABELS_ROLE[profil?.role] || profil?.role}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-uppercase small fw-semibold text-muted mb-4" style={{ letterSpacing: '0.06em' }}>
                  Informations professionnelles
                </p>
                <div className="row g-4">
                  {champs.map((c, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width: '42px', height: '42px', background: '#f8fafc', border: '1px solid var(--cpg-border)' }}
                        >
                          <i className={`bi ${c.icone}`} style={{ color: 'var(--cpg-primary)', fontSize: '16px' }}></i>
                        </div>
                        <div className="pt-1">
                          <p className="text-muted mb-0" style={{ fontSize: '12.5px' }}>{c.label}</p>
                          <p className="fw-semibold mb-0" style={{ fontSize: '15px' }}>{c.valeur || '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne sécurité */}
        <div className="col-lg-4">
          <div
            className="p-4"
            style={{
              borderRadius: '16px',
              border: '1px solid var(--cpg-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              background: '#fff',
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, var(--cpg-primary), var(--cpg-accent))' }}
              >
                <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: '18px' }}></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Sécurité du compte</h6>
                <p className="text-muted mb-0" style={{ fontSize: '12.5px' }}>Gérez votre mot de passe</p>
              </div>
            </div>

            {!afficherFormMdp && (
              <button
                onClick={() => setAfficherFormMdp(true)}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  border: '1px solid var(--cpg-border)',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 500,
                  color: 'var(--cpg-text)',
                  background: '#f8fafc',
                }}
              >
                <i className="bi bi-key-fill"></i> Changer mon mot de passe
              </button>
            )}

            {afficherFormMdp && (
              <form onSubmit={handleChangerMdp}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Ancien mot de passe</label>
                  <input
                    type="password"
                    value={mdpForm.ancien}
                    onChange={(e) => setMdpForm({ ...mdpForm, ancien: e.target.value })}
                    required
                    className="form-control"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={mdpForm.nouveau}
                    onChange={(e) => setMdpForm({ ...mdpForm, nouveau: e.target.value })}
                    required
                    minLength={6}
                    className="form-control"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={mdpForm.confirmation}
                    onChange={(e) => setMdpForm({ ...mdpForm, confirmation: e.target.value })}
                    required
                    className="form-control"
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                {erreurMdp && (
                  <div className="alert alert-danger py-2 small" style={{ borderRadius: '10px' }}>{erreurMdp}</div>
                )}
                {succesMdp && (
                  <div className="alert alert-success py-2 small" style={{ borderRadius: '10px' }}>{succesMdp}</div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    disabled={chargementMdp}
                    className="btn btn-cpg-primary flex-grow-1"
                    style={{ borderRadius: '10px', padding: '10px' }}
                  >
                    {chargementMdp ? 'Envoi...' : 'Confirmer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAfficherFormMdp(false)}
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: '10px', padding: '10px' }}
                  >
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