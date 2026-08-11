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

function calculerAnciennete(dateStr) {
  if (!dateStr) return null;
  // supporte DD/MM/YYYY ou YYYY-MM-DD
  let d;
  if (dateStr.includes('/')) {
    const [j, m, a] = dateStr.split('/');
    d = new Date(`${a}-${m}-${j}`);
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) return null;
  const ans = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ans < 0) return null;
  return ans < 1 ? "Moins d'un an" : `${Math.floor(ans)} an${Math.floor(ans) > 1 ? 's' : ''}`;
}

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

  const anciennete = calculerAnciennete(profil?.date_embauche);
  const chipsRapides = [
    profil?.matricule && { icone: 'bi-hash', texte: profil.matricule },
    anciennete && { icone: 'bi-award', texte: anciennete },
    profil?.service_code && { icone: 'bi-buildings', texte: profil.service_code },
  ].filter(Boolean);

  return (
    <LayoutSelon>
      <style>{`
        @keyframes profilFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profil-anim { animation: profilFadeUp 0.45s ease both; }
        .profil-anim-1 { animation-delay: 0.05s; }
        .profil-anim-2 { animation-delay: 0.12s; }
        @media (prefers-reduced-motion: reduce) {
          .profil-anim { animation: none; }
        }
        .profil-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(32, 30, 30, 0.16);
          color: #333131;
          font-size: 12.5px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .profil-champ-row:not(:last-child) {
          border-bottom: 1px solid var(--cpg-border);
          padding-bottom: 18px;
          margin-bottom: 18px;
        }
        .profil-mdp-btn:hover {
          background: var(--cpg-primary-light) !important;
          border-color: var(--cpg-primary) !important;
          color: var(--cpg-primary) !important;
        }
      `}</style>

      <div className="mb-4 profil-anim">
        <p className="text-uppercase small fw-semibold mb-1" style={{ color: 'var(--cpg-accent)', letterSpacing: '0.08em' }}>
          Espace personnel
        </p>
        <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>Mon profil</h2>
      </div>

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          <div
            className="overflow-hidden profil-anim profil-anim-1"
            style={{
              borderRadius: '16px',
              border: '1px solid var(--cpg-border)',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Bannière avec motif subtil */}
            <div
              style={{
                height: '130px',
                position: 'relative',
                background: 'linear-gradient(120deg, #ffffff, #f0f2f5)',
                backgroundImage: `
      radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.5px, transparent 1.5px),
      linear-gradient(120deg, #e8ebee, #f5f6f7)
    `,
                backgroundSize: '18px 18px, 100% 100%',
              }}
            >
              <div className="position-absolute d-flex gap-2" style={{ top: '16px', right: '20px' }}>
                {chipsRapides.map((c, i) => (
                  <span key={i} className="profil-chip">
                    <i className={`bi ${c.icone}`}></i> {c.texte}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-4 px-md-5 pb-5">
              <div className="d-flex flex-column align-items-start">
                <div style={{ position: 'relative', marginTop: '-48px' }}>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                    style={{
                      width: '96px',
                      height: '96px',
                      background: 'linear-gradient(135deg, var(--cpg-primary), var(--cpg-accent))',
                      fontSize: '30px',
                      border: '5px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    {profil?.prenom?.charAt(0)}{profil?.nom?.charAt(0)}
                  </div>
                  <span
                    title="En ligne"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '3px solid #fff',
                    }}
                  />
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
                <div className="row g-0">
                  {champs.map((c, i) => (
                    <div key={i} className="col-sm-6 pe-sm-4">
                      <div className="d-flex align-items-start gap-3 profil-champ-row">
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
            className="p-4 profil-anim profil-anim-2"
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
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 profil-mdp-btn"
                style={{
                  border: '1px solid var(--cpg-border)',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 500,
                  color: 'var(--cpg-text)',
                  background: '#f8fafc',
                  transition: 'all 0.15s ease',
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