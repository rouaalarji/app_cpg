const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM type_conge');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM type_conge WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nom, nbJoursParAn, necessiteJustificatif }) {
  const [result] = await db.query(
    'INSERT INTO type_conge (nom, nb_jours_par_an, necessite_justificatif) VALUES (?, ?, ?)',
    [nom, nbJoursParAn, necessiteJustificatif || false]
  );
  return result.insertId;
}

async function update(id, { nom, nbJoursParAn, necessiteJustificatif }) {
  await db.query(
    'UPDATE type_conge SET nom = ?, nb_jours_par_an = ?, necessite_justificatif = ? WHERE id = ?',
    [nom, nbJoursParAn, necessiteJustificatif || false, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM type_conge WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };