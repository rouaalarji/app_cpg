const db = require('../config/database');

async function getStats(req, res) {
  try {
    const [[{ totalEmployes }]] = await db.query(
      "SELECT COUNT(*) AS totalEmployes FROM employe WHERE statut = 'ACTIF'"
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

    res.json({ totalEmployes, demandesEnAttente, totalServices, absencesNonJustifiees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
const employeModel = require('../models/employe_model');

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
