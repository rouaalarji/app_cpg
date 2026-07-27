const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM employe');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM employe WHERE id = ?', [id]);
  return rows[0];
}

async function getByServiceId(serviceId) {
  const [rows] = await db.query('SELECT * FROM employe WHERE service_id = ?', [serviceId]);
  return rows;
}

async function getByChefId(chefId) {
  const [rows] = await db.query('SELECT * FROM employe WHERE chef_id = ?', [chefId]);
  return rows;
}
async function create(employe) {
  const { utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, poste, serviceId, chefId, zoneTravail } = employe;
  const [result] = await db.query(
    `INSERT INTO employe 
      (utilisateur_id, matricule, nom, prenom, date_naissance, date_embauche, poste, service_id, chef_id, zone_travail) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, poste, serviceId, chefId || null, zoneTravail || 'ADMINISTRATIF']
  );
  return result.insertId;
}

async function update(id, employe) {
  const { nom, prenom, dateNaissance, poste, serviceId, chefId, statut, zoneTravail } = employe;
  await db.query(
    `UPDATE employe 
     SET nom = ?, prenom = ?, date_naissance = ?, poste = ?, service_id = ?, chef_id = ?, statut = ?, zone_travail = ?
     WHERE id = ?`,
    [nom, prenom, dateNaissance, poste, serviceId, chefId || null, statut, zoneTravail, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM employe WHERE id = ?', [id]);
}
async function getServiceIdParUtilisateur(utilisateurId) {
  const [rows] = await db.query('SELECT service_id FROM employe WHERE utilisateur_id = ?', [utilisateurId]);
  return rows[0]?.service_id;
}
async function getByServiceIdAvecPresence(serviceId, date) {
  const [rows] = await db.query(`
    SELECT e.*, p.statut AS statut_presence, p.heure_arrivee, p.heure_depart
    FROM employe e
    LEFT JOIN presence p ON p.employe_id = e.id AND p.date = ?
    WHERE e.service_id = ?
    ORDER BY e.nom
  `, [date, serviceId]);
  return rows;
}
async function getEmployesAvecRoleChef() {
  const [rows] = await db.query(`
    SELECT e.id, e.nom, e.prenom, e.matricule
    FROM employe e
    JOIN utilisateur u ON e.utilisateur_id = u.id
    WHERE u.role = 'CHEF'
  `);
  return rows;
}
async function getProfilComplet(utilisateurId) {
  const [rows] = await db.query(`
    SELECT e.matricule, e.nom, e.prenom, e.poste, 
           s.nom AS service_nom, d.nom AS departement_nom
    FROM employe e
    JOIN service s ON e.service_id = s.id
    JOIN departement d ON s.departement_id = d.id
    WHERE e.utilisateur_id = ?
  `, [utilisateurId]);
  return rows[0];
}
module.exports = { getAll, getById, getByServiceId, getByChefId, create, update, remove, getServiceIdParUtilisateur, getByServiceIdAvecPresence, getEmployesAvecRoleChef, getProfilComplet };