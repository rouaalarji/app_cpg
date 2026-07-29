const db = require('../config/database');

async function getAll() {
  const [rows] = await db.query('SELECT * FROM type_conge ORDER BY nom');
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM type_conge WHERE id = ?', [id]);
  return rows[0];
}

async function create({ code, nom, description, nbJoursParAn, necessiteJustificatif }) {
  const [result] = await db.query(
    'INSERT INTO type_conge (code, nom, description, nb_jours_par_an, necessite_justificatif) VALUES (?, ?, ?, ?, ?)',
    [code, nom, description || null, nbJoursParAn, necessiteJustificatif || false]
  );
  return result.insertId;
}

async function update(id, { code, nom, description, nbJoursParAn, necessiteJustificatif }) {
  await db.query(
    'UPDATE type_conge SET code = ?, nom = ?, description = ?, nb_jours_par_an = ?, necessite_justificatif = ? WHERE id = ?',
    [code, nom, description || null, nbJoursParAn, necessiteJustificatif || false, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM type_conge WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };