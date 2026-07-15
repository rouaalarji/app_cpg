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
  const { utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, poste, serviceId, chefId } = employe;
  const [result] = await db.query(
    `INSERT INTO employe 
      (utilisateur_id, matricule, nom, prenom, date_naissance, date_embauche, poste, service_id, chef_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [utilisateurId, matricule, nom, prenom, dateNaissance, dateEmbauche, poste, serviceId, chefId || null]
  );
  return result.insertId;
}

async function update(id, employe) {
  const { nom, prenom, dateNaissance, poste, serviceId, chefId, statut } = employe;
  await db.query(
    `UPDATE employe 
     SET nom = ?, prenom = ?, date_naissance = ?, poste = ?, service_id = ?, chef_id = ?, statut = ?
     WHERE id = ?`,
    [nom, prenom, dateNaissance, poste, serviceId, chefId || null, statut, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM employe WHERE id = ?', [id]);
}

module.exports = { getAll, getById, getByServiceId, getByChefId, create, update, remove };