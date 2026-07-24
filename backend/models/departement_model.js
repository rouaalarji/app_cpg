const db = require('../config/database');

async function getAllDetaille() {
  const [rows] = await db.query(`
    SELECT 
      d.*,
      CONCAT(e.prenom, ' ', e.nom) AS responsable_nom,
      (SELECT COUNT(*) FROM service WHERE departement_id = d.id) AS nb_services,
      (SELECT COUNT(*) FROM employe emp 
         JOIN service s ON emp.service_id = s.id 
         WHERE s.departement_id = d.id) AS nb_employes
    FROM departement d
    LEFT JOIN employe e ON d.responsable_id = e.id
    ORDER BY d.nom
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM departement WHERE id = ?', [id]);
  return rows[0];
}

async function create({ nom, description, responsableId, statut }) {
  const [result] = await db.query(
    'INSERT INTO departement (nom, description, responsable_id, statut) VALUES (?, ?, ?, ?)',
    [nom, description || null, responsableId || null, statut || 'ACTIF']
  );
  return result.insertId;
}

async function update(id, { nom, description, responsableId, statut }) {
  await db.query(
    'UPDATE departement SET nom = ?, description = ?, responsable_id = ?, statut = ? WHERE id = ?',
    [nom, description || null, responsableId || null, statut, id]
  );
}

async function remove(id) {
  await db.query('DELETE FROM departement WHERE id = ?', [id]);
}

module.exports = { getAllDetaille, getById, create, update, remove };