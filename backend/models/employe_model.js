const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query(`
    SELECT e.*, s.nom AS service_nom
    FROM employe e
    LEFT JOIN service s ON e.service_id = s.id
    ORDER BY e.nom
  `);
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

async function getServiceIdParUtilisateur(utilisateurId) {
  const [rows] = await db.query('SELECT service_id FROM employe WHERE utilisateur_id = ?', [utilisateurId]);
  return rows[0]?.service_id;
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
    SELECT e.matricule, e.nom, e.prenom, e.date_embauche, e.date_naissance,
           s.nom AS service_nom, s.code AS service_code, d.nom AS departement_nom,
           u.email, u.role
    FROM employe e
    JOIN service s ON e.service_id = s.id
    JOIN departement d ON s.departement_id = d.id
    JOIN utilisateur u ON e.utilisateur_id = u.id
    WHERE e.utilisateur_id = ?
  `, [utilisateurId]);
  return rows[0];
}

async function create(employe) {
  const { utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, serviceId } = employe;
  const [result] = await db.query(
    `INSERT INTO employe 
      (utilisateur_id, matricule, nom, prenom, date_naissance, date_embauche, service_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, serviceId]
  );
  return result.insertId;
}

async function update(id, employe) {
  const { nom, prenom, dateNaissance, serviceId, statut } = employe;
  await db.query(
    `UPDATE employe 
     SET nom = ?, prenom = ?, date_naissance = ?, service_id = ?, statut = ?
     WHERE id = ?`,
    [nom, prenom, dateNaissance, serviceId, statut, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM employe WHERE id = ?', [id]);
}

module.exports = {
  getAll, getById, getByServiceId, getByServiceIdAvecPresence, getServiceIdParUtilisateur,
  getEmployesAvecRoleChef, getProfilComplet, create, update, remove,
};