const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM absence ORDER BY date_debut DESC');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM absence WHERE id = ?', [id]);
  return rows[0];
}

async function getByEmployeId(employeId) {
  const [rows] = await db.query(
    'SELECT * FROM absence WHERE employe_id = ? ORDER BY date_debut DESC',
    [employeId]
  );
  return rows;
}

async function create({ employeId, dateDebut, dateFin, motif, justificatif, statut }) {
  const [result] = await db.query(
    `INSERT INTO absence (employe_id, date_debut, date_fin, motif, justificatif, statut)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [employeId, dateDebut, dateFin, motif || null, justificatif || null, statut || 'NON_JUSTIFIEE']
  );
  return result.insertId;
}

async function update(id, { motif, justificatif, statut }) {
  await db.query(
    'UPDATE absence SET motif = ?, justificatif = ?, statut = ? WHERE id = ?',
    [motif, justificatif, statut, id]
  );
}

module.exports = { getAll, getById, getByEmployeId, create, update };