const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM jour_ferie ORDER BY date ASC');
  return rows;
}

async function getByMois(annee, mois) {
  const [rows] = await db.query(
    'SELECT * FROM jour_ferie WHERE YEAR(date) = ? AND MONTH(date) = ?',
    [annee, mois]
  );
  return rows;
}

async function getByDate(date) {
  const [rows] = await db.query('SELECT * FROM jour_ferie WHERE date = ?', [date]);
  return rows[0];
}

async function getProchains(limite = 5) {
  const [rows] = await db.query(
    'SELECT * FROM jour_ferie WHERE date >= CURDATE() ORDER BY date ASC LIMIT ?',
    [limite]
  );
  return rows;
}

async function create({ date, type, description }) {
  const [result] = await db.query(
    'INSERT INTO jour_ferie (date, type, description) VALUES (?, ?, ?)',
    [date, type || 'FERIE', description || null]
  );
  return result.insertId;
}

async function remove(id) {
  await db.query('DELETE FROM jour_ferie WHERE id = ?', [id]);
}

async function removeByDate(date) {
  await db.query('DELETE FROM jour_ferie WHERE date = ?', [date]);
}

module.exports = { getAll, getByMois, getByDate, getProchains, create, remove, removeByDate };