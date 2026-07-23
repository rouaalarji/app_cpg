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

module.exports = { getStats };