
const db = require('../config/database');
const employeModel = require('../models/employe_model');
async function getStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [[{ totalEmployes }]] = await db.query(
      "SELECT COUNT(*) AS totalEmployes FROM employe"
    );
    const [[{ employesActifs }]] = await db.query(
      "SELECT COUNT(*) AS employesActifs FROM employe WHERE statut = 'ACTIF'"
    );
    const [[{ presentsAujourdhui }]] = await db.query(
      "SELECT COUNT(*) AS presentsAujourdhui FROM presence WHERE date = ? AND statut = 'PRESENT'",
      [today]
    );
    const [[{ employesAbsentsAujourdhui }]] = await db.query(
      "SELECT COUNT(*) AS employesAbsentsAujourdhui FROM presence WHERE date = ? AND statut = 'ABSENT'",
      [today]
    );
    const [[{ congesEnCours }]] = await db.query(
      `SELECT COUNT(*) AS congesEnCours FROM demande_conge 
       WHERE statut = 'VALIDE_RH' AND ? BETWEEN date_debut AND date_fin`,
      [today]
    );
    const [[{ demandesEnAttente }]] = await db.query(
      "SELECT COUNT(*) AS demandesEnAttente FROM demande_conge WHERE statut IN ('EN_ATTENTE', 'VALIDE_CHEF')"
    );
    const [[{ totalServices }]] = await db.query(
      "SELECT COUNT(*) AS totalServices FROM service"
    );
    const [[{ absencesNonJustifiees }]] = await db.query(
      "SELECT COUNT(*) AS absencesNonJustifiees FROM absence WHERE statut = 'NON_JUSTIFIEE'"
    );

    // Pointage du jour (pour le donut chart)
    const [[{ nonPointes }]] = await db.query(
      `SELECT COUNT(*) AS nonPointes FROM employe e
       WHERE e.statut = 'ACTIF'
       AND NOT EXISTS (SELECT 1 FROM presence p WHERE p.employe_id = e.id AND p.date = ?)`,
      [today]
    );
    const pointageJour = {
      presents: presentsAujourdhui,
      absents: employesAbsentsAujourdhui,
      enConge: congesEnCours,
      nonPointes,
    };

    // Répartition par département
    const [repartitionDepartements] = await db.query(`
      SELECT d.nom, COUNT(e.id) AS total
      FROM departement d
      LEFT JOIN service s ON s.departement_id = d.id
      LEFT JOIN employe e ON e.service_id = s.id
      GROUP BY d.id
      ORDER BY total DESC
    `);

    // Répartition par service
    const [repartitionServices] = await db.query(`
      SELECT s.nom, COUNT(e.id) AS total
      FROM service s
      LEFT JOIN employe e ON e.service_id = s.id
      GROUP BY s.id
      ORDER BY total DESC
      LIMIT 8
    `);

    // Demandes de congé récentes (5 dernières)
    const [demandesRecentesRaw] = await db.query(`
      SELECT dc.date_debut, dc.date_fin, dc.statut,
             CONCAT(e.prenom, ' ', e.nom) AS employeNom,
             tc.nom AS typeConge
      FROM demande_conge dc
      JOIN employe e ON dc.employe_id = e.id
      JOIN type_conge tc ON dc.type_conge_id = tc.id
      ORDER BY dc.date_creation DESC
      LIMIT 5
    `);

    const LABELS_ETAT = {
      EN_ATTENTE: 'En attente',
      VALIDE_CHEF: 'En attente',
      VALIDE_RH: 'Acceptée',
      REFUSE: 'Refusée',
    };

    const demandesRecentes = demandesRecentesRaw.map((d) => ({
      employeNom: d.employeNom,
      typeConge: d.typeConge,
      dateDebut: d.date_debut,
      dateFin: d.date_fin,
      etat: LABELS_ETAT[d.statut] || d.statut,
    }));

    res.json({
      totalEmployes,
      employesActifs,
      presentsAujourdhui,
      employesAbsentsAujourdhui,
      congesEnCours,
      demandesEnAttente,
      totalServices,
      absencesNonJustifiees,
      pointageJour,
      repartitionDepartements,
      repartitionServices,
      demandesRecentes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getStatsChef(req, res) {
  try {
    const serviceId = await employeModel.getServiceIdParUtilisateur(req.utilisateur.id);
    if (!serviceId) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }

    const today = new Date().toISOString().split('T')[0];

    const [[{ totalEmployes }]] = await db.query(
      "SELECT COUNT(*) AS totalEmployes FROM employe WHERE service_id = ? AND statut = 'ACTIF'",
      [serviceId]
    );

    const [[{ presents }]] = await db.query(
      `SELECT COUNT(*) AS presents FROM presence p
       JOIN employe e ON p.employe_id = e.id
       WHERE e.service_id = ? AND p.date = ? AND p.statut = 'PRESENT'`,
      [serviceId, today]
    );

    const [[{ absents }]] = await db.query(
      `SELECT COUNT(*) AS absents FROM presence p
       JOIN employe e ON p.employe_id = e.id
       WHERE e.service_id = ? AND p.date = ? AND p.statut = 'ABSENT'`,
      [serviceId, today]
    );

    const [[{ retards }]] = await db.query(
      `SELECT COUNT(*) AS retards FROM presence p
       JOIN employe e ON p.employe_id = e.id
       WHERE e.service_id = ? AND p.date = ? AND p.statut = 'RETARD'`,
      [serviceId, today]
    );

    const [[{ enConge }]] = await db.query(
      `SELECT COUNT(*) AS enConge FROM demande_conge dc
       JOIN employe e ON dc.employe_id = e.id
       WHERE e.service_id = ? AND dc.statut = 'VALIDE_RH' 
       AND ? BETWEEN dc.date_debut AND dc.date_fin`,
      [serviceId, today]
    );

    const [[{ demandesEnAttente }]] = await db.query(
      `SELECT COUNT(*) AS demandesEnAttente FROM demande_conge dc
       JOIN employe e ON dc.employe_id = e.id
       WHERE e.service_id = ? AND dc.statut = 'EN_ATTENTE'`,
      [serviceId]
    );

    res.json({ totalEmployes, presents, absents, retards, enConge, demandesEnAttente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getStats, getStatsChef };
