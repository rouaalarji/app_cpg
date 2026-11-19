const db = require('../config/database');
// Toutes les demandes, pour la page admin "Validation congés".
async function getAll() {
  const [rows] = await db.query(`
    SELECT dc.*, e.nom AS employe_nom, e.prenom AS employe_prenom, e.matricule,
           tc.nom AS type_conge_nom
    FROM demande_conge dc
    JOIN employe e ON dc.employe_id = e.id
    JOIN type_conge tc ON dc.type_conge_id = tc.id
    ORDER BY dc.date_creation DESC
  `);
  return rows;
}
// Une seule demande par son id. rows[0] : premier résultat, ou undefined si inexistant.

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM demande_conge WHERE id = ?', [id]);
  return rows[0];
}
  // Historique des demandes d'un employé (page "Mes congés" de l'employé)
async function getByEmployeId(employeId) {
  const [rows] = await db.query(
    'SELECT * FROM demande_conge WHERE employe_id = ? ORDER BY date_creation DESC',
    [employeId]
  );
  return rows;
}

// Demandes en attente de validation par un chef précis 
async function getEnAttentePourChef(chefId) {
  const [rows] = await db.query(
    `SELECT dc.* FROM demande_conge dc
     JOIN employe e ON dc.employe_id = e.id
     WHERE e.chef_id = ? AND dc.statut = 'EN_ATTENTE'
     ORDER BY dc.date_creation ASC`,
    [chefId]
  );
  return rows;
}

// Demandes déjà validées par un chef, en attente de la validation RH
async function getEnAttentePourRh() {
  const [rows] = await db.query(
    `SELECT * FROM demande_conge WHERE statut = 'VALIDE_CHEF' ORDER BY date_creation ASC`
  );
  return rows;
}
// Crée une demande de congé.
async function create({ employeId, typeCongeId, dateDebut, dateFin, nbJours, motif, adresseConge, telephoneConge, pieceJustificative, statutInitial }) {
  const [result] = await db.query(
    `INSERT INTO demande_conge 
      (employe_id, type_conge_id, date_debut, date_fin, nb_jours, motif, adresse_conge, telephone_conge, piece_justificative, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employeId, typeCongeId, dateDebut, dateFin, nbJours, motif || null, adresseConge || null, telephoneConge || null, pieceJustificative || null, statutInitial || 'EN_ATTENTE']
  );
  return result.insertId;
}

async function validerParChef(id, chefId) {
  await db.query(
    `UPDATE demande_conge 
     SET statut = 'VALIDE_CHEF', validateur_chef_id = ?, date_validation_chef = NOW()
     WHERE id = ?`,
    [chefId, id]
  );
}

async function validerParRh(id, rhId) {
  await db.query(
    `UPDATE demande_conge 
     SET statut = 'VALIDE_RH', validateur_rh_id = ?, date_validation_rh = NOW()
     WHERE id = ?`,
    [rhId, id]
  );
}

async function refuser(id, commentaire) {
  await db.query(
    `UPDATE demande_conge SET statut = 'REFUSE', commentaire_refus = ? WHERE id = ?`,
    [commentaire || null, id]
  );
}
// Demandes de l'équipe d'un Chef, filtrées par service, en attente de son avis
async function getParServiceEnAttente(serviceId) {
  const [rows] = await db.query(`
    SELECT dc.*, e.nom AS employe_nom, e.prenom AS employe_prenom, e.matricule
    FROM demande_conge dc
    JOIN employe e ON dc.employe_id = e.id
    WHERE e.service_id = ? AND dc.statut = 'EN_ATTENTE'
    ORDER BY dc.date_creation ASC
  `, [serviceId]);
  return rows;
}
async function getJoursUtilisesCetteAnnee(employeId, typeCongeId) {
  // Total de jours déjà pris ou demandés cette année pour un type de congé,

  const [[{ total }]] = await db.query(
    `SELECT COALESCE(SUM(nb_jours), 0) AS total 
     FROM demande_conge 
     WHERE employe_id = ? AND type_conge_id = ? 
     AND statut IN ('EN_ATTENTE', 'VALIDE_CHEF', 'VALIDE_RH')
     AND YEAR(date_debut) = YEAR(CURDATE())`,
    [employeId, typeCongeId]
  );
  return total;
}
async function getChevauchement(employeId, dateDebut, dateFin) {
  // Détecte si la nouvelle période croise une demande existante du même employé.
// Deux périodes se chevauchent si : début_existante <= fin_nouvelle ET fin_existante >= début_nouvelle.
  const [rows] = await db.query(
    `SELECT * FROM demande_conge 
     WHERE employe_id = ? 
     AND statut IN ('EN_ATTENTE', 'VALIDE_CHEF', 'VALIDE_RH')
     AND date_debut <= ? AND date_fin >= ?`,
    [employeId, dateFin, dateDebut]
  );
  return rows;
}
async function annuler(id, employeId) {
  const [result] = await db.query(
    `DELETE FROM demande_conge WHERE id = ? AND employe_id = ? AND statut = 'EN_ATTENTE'`,
    [id, employeId]
  );
  return result.affectedRows > 0;
}
async function getProchainCongeValide(employeId) {
  const [rows] = await db.query(
    `SELECT * FROM demande_conge 
     WHERE employe_id = ? AND statut = 'VALIDE_RH' AND date_fin >= CURDATE()
     ORDER BY date_debut ASC LIMIT 1`,
    [employeId]
  );
  return rows[0];
}
async function getStatsMois(mois) {
  // mois au format 'YYYY-MM' — on se base sur la date de création de la demande
  const [[totaux]] = await db.query(`
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) AS enAttente,
      SUM(CASE WHEN statut = 'VALIDE_RH' THEN 1 ELSE 0 END) AS acceptees,
      SUM(CASE WHEN statut = 'REFUSE' THEN 1 ELSE 0 END) AS refusees
    FROM demande_conge
    WHERE DATE_FORMAT(date_creation, '%Y-%m') = ?
  `, [mois]);

  const [parType] = await db.query(`
    SELECT tc.nom AS type_conge_nom, COUNT(*) AS nb_demandes
    FROM demande_conge dc
    JOIN type_conge tc ON dc.type_conge_id = tc.id
    WHERE DATE_FORMAT(dc.date_creation, '%Y-%m') = ?
    GROUP BY tc.id
    ORDER BY nb_demandes DESC
  `, [mois]);

  return { mois, ...totaux, parType };
}
module.exports = {
  getAll, getById, getByEmployeId, getEnAttentePourChef, getEnAttentePourRh,
  create, validerParChef, validerParRh, refuser,getParServiceEnAttente,getJoursUtilisesCetteAnnee, getChevauchement, annuler, getProchainCongeValide, getStatsMois
};