const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM presence ORDER BY date DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM presence WHERE id = ?', [id]);
  return rows[0];
}

async function getByEmployeId(employeId) {
  const [rows] = await db.query(
    'SELECT * FROM presence WHERE employe_id = ? ORDER BY date DESC',
    [employeId]
  );
  return rows;
}

async function getByEmployeAndDate(employeId, date) {
  const [rows] = await db.query(
    'SELECT * FROM presence WHERE employe_id = ? AND date = ?',
    [employeId, date]
  );
  return rows[0];
}

async function create({ employeId, date, heureArrivee, heureDepart, statut }) {
  const [result] = await db.query(
    `INSERT INTO presence (employe_id, date, heure_arrivee, heure_depart, statut)
     VALUES (?, ?, ?, ?, ?)`,
    [employeId, date, heureArrivee || null, heureDepart || null, statut || 'PRESENT']
  );
  return result.insertId;
}

async function updateHeureDepart(id, heureDepart) {
  await db.query('UPDATE presence SET heure_depart = ? WHERE id = ?', [heureDepart, id]);
}

async function update(id, { heureArrivee, heureDepart, statut }) {
  await db.query(
    'UPDATE presence SET heure_arrivee = ?, heure_depart = ?, statut = ? WHERE id = ?',
    [heureArrivee, heureDepart, statut, id]
  );
}

module.exports = { getAll, getById, getByEmployeId, getByEmployeAndDate, create, updateHeureDepart, update };