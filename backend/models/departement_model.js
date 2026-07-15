const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM departement');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM departement WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nom }) {
  const [result] = await db.query('INSERT INTO departement (nom) VALUES (?)', [nom]);
  return result.insertId;
}

async function update(id, { nom }) {
  await db.query('UPDATE departement SET nom = ? WHERE id = ?', [nom, id]);
}

async function remove(id) {
  await db.query('DELETE FROM departement WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };