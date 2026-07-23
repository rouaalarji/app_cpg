const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM demande_conge ORDER BY date_creation DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM demande_conge WHERE id = ?', [id]);
  return rows[0];
}

async function getByEmployeId(employeId) {
  const [rows] = await db.query(
    'SELECT * FROM demande_conge WHERE employe_id = ? ORDER BY date_creation DESC',
    [employeId]
  );
  return rows;
}

// Demandes en attente de validation par un chef précis (ses subordonnés)
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

async function create({ employeId, typeCongeId, dateDebut, dateFin, nbJours, motif }) {
  const [result] = await db.query(
    `INSERT INTO demande_conge (employe_id, type_conge_id, date_debut, date_fin, nb_jours, motif, statut)
     VALUES (?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
    [employeId, typeCongeId, dateDebut, dateFin, nbJours, motif || null]
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
module.exports = {
  getAll, getById, getByEmployeId, getEnAttentePourChef, getEnAttentePourRh,
  create, validerParChef, validerParRh, refuser,getParServiceEnAttente,
};