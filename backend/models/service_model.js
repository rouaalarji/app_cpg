const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM service');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM service WHERE id = ?', [id]);
  return rows[0];
}

async function getByDepartementId(departementId) {
  const [rows] = await db.query('SELECT * FROM service WHERE departement_id = ?', [departementId]);
  return rows;
}

async function create({ code, nom, departementId, responsableId, description, statut }) {
  const [result] = await db.query(
    'INSERT INTO service (code, nom, departement_id, responsable_id, description, statut) VALUES (?, ?, ?, ?, ?, ?)',
    [code, nom, departementId, responsableId || null, description || null, statut || 'ACTIF']
  );
  return result.insertId;
}

async function update(id, { code, nom, departementId, responsableId, description, statut }) {
  await db.query(
    'UPDATE service SET code = ?, nom = ?, departement_id = ?, responsable_id = ?, description = ?, statut = ? WHERE id = ?',
    [code, nom, departementId, responsableId || null, description || null, statut, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM service WHERE id = ?', [id]);
}
async function getAllDetaille() {
  const [rows] = await db.query(`
    SELECT 
      s.*,
      d.nom AS departement_nom,
      CONCAT(e.prenom, ' ', e.nom) AS chef_nom,
      (SELECT COUNT(*) FROM employe WHERE service_id = s.id) AS nb_employes
    FROM service s
    JOIN departement d ON s.departement_id = d.id
    LEFT JOIN employe e ON s.chef_id = e.id
    ORDER BY s.code ASC
  `);
  return rows;
}
async function getDetailParResponsable(employeId) {
  const [rows] = await db.query(`
    SELECT s.id, s.code, s.nom AS service_nom, d.nom AS departement_nom,
           CONCAT(e.prenom, ' ', e.nom) AS chef_nom
    FROM service s
    JOIN departement d ON s.departement_id = d.id
    JOIN employe e ON s.chef_id = e.id
    WHERE s.chef_id = ?
  `, [employeId]);
  return rows[0];
}
async function getServiceParResponsable(employeId) {
  const [rows] = await db.query('SELECT * FROM service WHERE chef_id = ?', [employeId]);
  return rows[0];
}
module.exports = { getAll, getById, getByDepartementId, create, update, remove, getAllDetaille, getDetailParResponsable, getServiceParResponsable };