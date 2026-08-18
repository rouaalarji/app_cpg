import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMesPresences } from '../../services/presenceService';
import { getResumePersonnel } from '../../services/demandeCongeService';
import { getMesAbsences } from '../../services/absenceService';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function aujourdHuiStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDateAffichage(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function DashboardEmploye() {
  const { utilisateur } = useAuth();
  const [presenceDuJour, setPresenceDuJour] = useState(null);
  const [resume, setResume] = useState(null);
  const [absencesRecentes, setAbsencesRecentes] = useState([]);
  const [chargement, setChargement] = useState(true);

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const prenom = utilisateur?.email?.split('@')[0];

  useEffect(() => {
    async function charger() {
      try {
        const [presences, resumeData, absences] = await Promise.all([
          getMesPresences(),
          getResumePersonnel(),
          getMesAbsences(),
        ]);
        const duJour = presences.find((p) => p.date === aujourdHuiStr());
        setPresenceDuJour(duJour || null);
        setResume(resumeData);
        setAbsencesRecentes(absences.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <LayoutEmploye>
      {/* Message de bienvenue */}
      <div className="mb-4">
        <p className="text-uppercase small fw-semibold mb-1" style={{ color: 'var(--cpg-accent)', letterSpacing: '0.08em' }}>
          {salutation}
        </p>
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
          Bienvenue{prenom ? `, ${prenom}` : ''} 
        </h2>
        <p className="text-muted mb-0 text-capitalize">{formatDateAffichage(aujourdHuiStr())}</p>
      </div>

      {chargement && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '160px' }}>
          <div className="spinner-border" style={{ color: 'var(--cpg-primary)' }} role="status"></div>
        </div>
      )}

      {!chargement && (
        <div className="row g-3 mb-4">
          {/* Pointage du jour */}
          <div className="col-lg-7">
            <div className="p-4 h-100" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
              <p className="text-uppercase small fw-semibold text-muted mb-3" style={{ letterSpacing: '0.06em' }}>
                Pointage du jour
              </p>

              {presenceDuJour ? (
                <>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: '10px', height: '10px', background: 'var(--cpg-success)' }}
                    ></span>
                    <span className="fw-semibold" style={{ color: 'var(--cpg-success)' }}>Présence enregistrée</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-4">
                      <p className="text-muted mb-1" style={{ fontSize: '12px' }}>Heure d'entrée</p>
                      <p className="fw-bold mb-0">{presenceDuJour.heure_arrivee || '—'}</p>
                    </div>
                    <div className="col-4">
                      <p className="text-muted mb-1" style={{ fontSize: '12px' }}>Heure de sortie</p>
                      <p className="fw-bold mb-0">{presenceDuJour.heure_depart || '—'}</p>
                    </div>
                    <div className="col-4">
                      <p className="text-muted mb-1" style={{ fontSize: '12px' }}>Statut</p>
                      <span className={`badge ${
                        presenceDuJour.statut === 'PRESENT' ? 'badge-cpg-success' :
                        presenceDuJour.statut === 'RETARD' ? 'badge-cpg-warning' :
                        'badge-cpg-danger'
                      }`}>
                        {presenceDuJour.statut === 'PRESENT' ? 'Présent' :
                         presenceDuJour.statut === 'RETARD' ? 'Retard' : 'Absent'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: '10px', height: '10px', background: 'var(--cpg-warning)' }}
                  ></span>
                  <span className="fw-semibold" style={{ color: 'var(--cpg-warning)' }}>Pointage non enregistré</span>
                </div>
              )}
              {!presenceDuJour && (
                <p className="text-muted small mt-2 mb-0">
                  Votre chef de service n'a pas encore effectué le pointage d'aujourd'hui.
                </p>
              )}
            </div>
          </div>

          {/* Résumé congés */}
          <div className="col-lg-5">
            <div className="p-4 h-100" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
              <p className="text-uppercase small fw-semibold text-muted mb-3" style={{ letterSpacing: '0.06em' }}>
                Mes congés
              </p>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '44px', height: '44px', background: 'var(--cpg-primary-light)' }}
                >
                  <i className="bi bi-hourglass-split" style={{ color: 'var(--cpg-primary)' }}></i>
                </div>
                <div>
                  <p className="fw-bold mb-0" style={{ fontSize: '22px' }}>{resume?.enAttente ?? 0}</p>
                  <p className="text-muted mb-0" style={{ fontSize: '12.5px' }}>Demande(s) en attente</p>
                </div>
              </div>

              {resume?.prochainConge ? (
                <div className="p-3" style={{ borderRadius: '10px', background: 'var(--cpg-success-light)' }}>
                  <p className="mb-0" style={{ fontSize: '12.5px', color: '#047857' }}>
                    <i className="bi bi-airplane-fill me-1"></i>
                    Prochain congé validé : <strong>{resume.prochainConge.date_debut} → {resume.prochainConge.date_fin}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-muted small mb-0">Aucun congé à venir programmé.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Absences récentes */}
      {!chargement && absencesRecentes.length > 0 && (
        <div className="p-4 mb-4" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0" style={{ letterSpacing: '0.06em' }}>
              Absences récentes
            </p>
            <Link to="/employe/mes-absences" className="text-decoration-none" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cpg-primary)' }}>
              Voir tout <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          {absencesRecentes.map((a) => (
            <div key={a.id} className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: 'var(--cpg-border)', fontSize: '14px' }}>
              <span>{a.date_debut} → {a.date_fin}</span>
              <span className={`badge ${a.statut === 'JUSTIFIEE' ? 'badge-cpg-success' : 'badge-cpg-danger'}`}>
                {a.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non justifiée'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Accès rapides */}
      <p className="text-uppercase small fw-semibold text-muted mb-3" style={{ letterSpacing: '0.06em' }}>
        Accès rapides
      </p>
      <div className="row g-3">
        <CarteAction to="/employe/mes-conges" titre="Mes congés" description="Voir mes demandes et leur statut" icone="bi-calendar-check" />
        <CarteAction to="/employe/mes-absences" titre="Mes absences" description="Voir ou déclarer une absence" icone="bi-calendar-x" />
        <CarteAction to="/employe/mes-presences" titre="Mes présences" description="Historique de pointage" icone="bi-clock-history" />
      </div>
    </LayoutEmploye>
  );
}

function CarteAction({ to, titre, description, icone }) {
  return (
    <div className="col-md-4">
      <Link to={to} className="text-decoration-none">
        <div
          className="p-4 h-100"
          style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(79, 70, 229, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--cpg-primary), var(--cpg-accent))' }}
          >
            <i className={`bi ${icone} text-white`} style={{ fontSize: '20px' }}></i>
          </div>
          <h6 className="fw-bold mb-1">{titre}</h6>
          <p className="text-muted mb-0" style={{ fontSize: '13.5px' }}>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default DashboardEmploye;