import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStats } from '../../services/dashboardService';
import LayoutAdmin from '../../components/layout/LayoutAdmin';

function DashboardAdmin() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  useEffect(() => {
    async function charger() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur chargement stats', err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  // 1. Cartes statistiques (5 indicateurs clés)
  const cartesStats = [
    { titre: 'Total employés', valeur: stats?.totalEmployes, icone: 'bi-people-fill', couleur: '#4f46e5' },
    { titre: 'Employés actifs', valeur: stats?.employesActifs, icone: 'bi-person-check-fill', couleur: '#059669' },
    { titre: 'Absents aujourd\'hui', valeur: stats?.employesAbsentsAujourdhui, icone: 'bi-person-x-fill', couleur: '#dc2626' },
    { titre: 'Présents aujourd\'hui', valeur: stats?.presentsAujourdhui, icone: 'bi-check-circle-fill', couleur: '#0891b2' },
    { titre: 'Congés en cours', valeur: stats?.congesEnCours, icone: 'bi-airplane-fill', couleur: '#d97706' },
    { titre: 'Demandes en attente', valeur: stats?.demandesEnAttente, icone: 'bi-hourglass-split', couleur: '#7c3aed' },
  ];

  // 2. Pointage du jour
  const pointage = stats?.pointageJour || { presents: 0, absents: 0, enConge: 0, nonPointes: 0 };
  const dataPointage = [
    { name: 'Présents', value: pointage.presents, color: '#059669' },
    { name: 'Absents', value: pointage.absents, color: '#dc2626' },
    { name: 'En congé', value: pointage.enConge, color: '#d97706' },
    { name: 'Non pointés', value: pointage.nonPointes, color: '#9ca3af' },
  ];

  // 5. Répartition employés par département / service
  const repartitionDepartements = stats?.repartitionDepartements || [];
  const repartitionServices = stats?.repartitionServices || [];

  const demandesRecentes = stats?.demandesRecentes || [];

  const accesRapides = [
    { to: '/admin/validation-conges', titre: 'Validation congés', description: 'Voir et traiter les demandes en attente', icone: 'bi-check2-square' },
    ...(utilisateur?.role === 'RH' ? [
      { to: '/admin/employes', titre: 'Employés', description: 'Gérer les fiches et affectations', icone: 'bi-person-badge' },
      { to: '/admin/services', titre: 'Services', description: 'Structurer départements et services', icone: 'bi-diagram-3' },
    ] : []),
    ...(utilisateur?.role === 'ADMIN' ? [
      { to: '/admin/comptes', titre: 'Gestion des comptes', description: 'Créer et administrer les utilisateurs', icone: 'bi-shield-lock' },
    ] : []),
  ];

  function badgeEtat(etat) {
    const map = {
      'En attente': { bg: '#fef3c7', color: '#92400e' },
      'Acceptée': { bg: '#d1fae5', color: '#065f46' },
      'Refusée': { bg: '#fee2e2', color: '#991b1b' },
    };
    const style = map[etat] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span
        className="px-2 py-1 fw-semibold"
        style={{ background: style.bg, color: style.color, borderRadius: '8px', fontSize: '12.5px' }}
      >
        {etat}
      </span>
    );
  }

  return (
    <LayoutAdmin>
      {/* En-tête */}
      <div className="mb-4">
        <p className="text-uppercase small fw-semibold mb-1" style={{ color: 'var(--cpg-accent)', letterSpacing: '0.08em' }}>
          {salutation}
        </p>
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
          Tableau de bord {utilisateur?.role === 'RH' ? 'RH' : 'Administrateur'}
        </h2>
        <p className="text-muted mb-0">{utilisateur?.email}</p>
      </div>

      {chargement && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border" style={{ color: 'var(--cpg-primary)' }} role="status"></div>
        </div>
      )}

      {!chargement && stats && (
        <>
          {/* 1. Cartes statistiques */}
          <div className="row g-3 mb-4">
            {cartesStats.map((c, i) => (
              <div key={i} className="col-sm-6 col-lg-4 col-xl-2">
                <div
                  className="p-3 h-100 position-relative overflow-hidden"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid var(--cpg-border)',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ width: '40px', height: '40px', background: `${c.couleur}15` }}
                  >
                    <i className={`bi ${c.icone}`} style={{ color: c.couleur, fontSize: '17px' }}></i>
                  </div>
                  <p className="text-muted mb-1" style={{ fontSize: '12px' }}>{c.titre}</p>
                  <p className="fw-bold mb-0" style={{ fontSize: '26px', letterSpacing: '-0.02em', color: 'var(--cpg-text)' }}>
                    {c.valeur ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Pointage du jour */}
          <div className="row g-3 mb-4">
            <div className="col-lg-7">
              <div className="p-4 h-100" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
                <h6 className="fw-bold mb-3">Pointage du jour</h6>
                <div className="row g-3">
                  {dataPointage.map((d, i) => (
                    <div key={i} className="col-6 col-md-3">
                      <div className="p-3" style={{ borderRadius: '12px', background: `${d.color}0d` }}>
                        <p className="mb-1" style={{ fontSize: '12px', color: d.color, fontWeight: 600 }}>{d.name}</p>
                        <p className="fw-bold mb-0" style={{ fontSize: '22px' }}>{d.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="p-4 h-100 d-flex flex-column" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
                <h6 className="fw-bold mb-2">Répartition du jour</h6>
                <div style={{ flex: 1, minHeight: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataPointage} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {dataPointage.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Demandes de congé récentes */}
          <div className="p-4 mb-4" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Demandes de congé récentes</h6>
              <Link to="/admin/validation-conges" className="text-decoration-none" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cpg-primary)' }}>
                Voir tout <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                    <th>Employé</th>
                    <th>Type de congé</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {demandesRecentes.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-3">Aucune demande récente</td></tr>
                  )}
                  {demandesRecentes.map((d, i) => (
                    <tr key={i} style={{ fontSize: '14px' }}>
                      <td className="fw-semibold">{d.employeNom}</td>
                      <td>{d.typeConge}</td>
                      <td>{d.dateDebut}</td>
                      <td>{d.dateFin}</td>
                      <td>{badgeEtat(d.etat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Répartition des employés */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <div className="p-4 h-100" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
                <h6 className="fw-bold mb-3">Employés par département</h6>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repartitionDepartements}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 h-100" style={{ borderRadius: '16px', border: '1px solid var(--cpg-border)', background: '#fff' }}>
                <h6 className="fw-bold mb-3">Employés par service</h6>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repartitionServices}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Accès rapides */}
      <div className="mb-3">
        <p className="text-uppercase small fw-semibold text-muted mb-3" style={{ letterSpacing: '0.06em' }}>
          Accès rapides
        </p>
      </div>
      <div className="row g-3">
        {accesRapides.map((a, i) => (
          <div key={i} className="col-md-4">
            <Link to={a.to} className="text-decoration-none">
              <div
                className="p-4 h-100"
                style={{
                  borderRadius: '16px',
                  border: '1px solid var(--cpg-border)',
                  background: '#fff',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(79, 70, 229, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, var(--cpg-primary), var(--cpg-accent))',
                  }}
                >
                  <i className={`bi ${a.icone} text-white`} style={{ fontSize: '20px' }}></i>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: 'var(--cpg-text)' }}>{a.titre}</h6>
                <p className="text-muted mb-0" style={{ fontSize: '13.5px' }}>{a.description}</p>
                <div className="mt-3 d-flex align-items-center gap-1" style={{ color: 'var(--cpg-primary)', fontSize: '13px', fontWeight: 600 }}>
                  Accéder <i className="bi bi-arrow-right"></i>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </LayoutAdmin>
  );
}

export default DashboardAdmin;