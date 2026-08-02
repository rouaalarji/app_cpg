const db = require('../config/database');

async function getAllDetaille() {
  const [rows] = await db.query(`
    SELECT 
      d.*,
      (SELECT COUNT(*) FROM service WHERE departement_id = d.id) AS nb_services,
      (SELECT COUNT(*) FROM employe emp 
         JOIN service s ON emp.service_id = s.id 
         WHERE s.departement_id = d.id) AS nb_employes
    FROM departement d
    ORDER BY d.nom
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM departement WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nom, description, lieu }) {
  const [result] = await db.query(
    'INSERT INTO departement (nom, description, lieu) VALUES (?, ?, ?)',
    [nom, description || null, lieu || null]
  );
  return result.insertId;
}

async function update(id, { nom, description, lieu }) {
  await db.query(
    'UPDATE departement SET nom = ?, description = ?, lieu = ? WHERE id = ?',
    [nom, description || null, lieu || null, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM departement WHERE id = ?', [id]);
}

module.exports = { getAllDetaille, getById, create, update, remove };