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

async function create({ code, nom, departementId, responsableId }) {
  const [result] = await db.query(
    'INSERT INTO service (code, nom, departement_id, responsable_id) VALUES (?, ?, ?, ?)',
    [code, nom, departementId, responsableId || null]
  );
  return result.insertId;
}

async function update(id, { code, nom, departementId, responsableId }) {
  await db.query(
    'UPDATE service SET code = ?, nom = ?, departement_id = ?, responsable_id = ? WHERE id = ?',
    [code, nom, departementId, responsableId || null, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM service WHERE id = ?', [id]);
}

module.exports = { getAll, getById, getByDepartementId, create, update, remove };