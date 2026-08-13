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
async function getAllDetaille() {
  const [rows] = await db.query(`
    SELECT a.*, e.nom AS employe_nom, e.prenom AS employe_prenom, e.matricule, s.nom AS service_nom
    FROM absence a
    JOIN employe e ON a.employe_id = e.id
    JOIN service s ON e.service_id = s.id
    ORDER BY a.date_debut DESC
  `);
  return rows;
}

async function getStats() {
  const [[{ totalNonJustifiees }]] = await db.query(
    "SELECT COUNT(*) AS totalNonJustifiees FROM absence WHERE statut = 'NON_JUSTIFIEE'"
  );

  const [[{ totalCeMois }]] = await db.query(
    `SELECT COUNT(*) AS totalCeMois FROM absence 
     WHERE MONTH(date_debut) = MONTH(CURDATE()) AND YEAR(date_debut) = YEAR(CURDATE())`
  );

  const [topEmployes] = await db.query(`
    SELECT e.nom, e.prenom, COUNT(*) AS nb_absences
    FROM absence a
    JOIN employe e ON a.employe_id = e.id
    GROUP BY a.employe_id
    ORDER BY nb_absences DESC
    LIMIT 5
  `);

  const [parService] = await db.query(`
    SELECT s.nom AS service_nom, COUNT(*) AS nb_absences
    FROM absence a
    JOIN employe e ON a.employe_id = e.id
    JOIN service s ON e.service_id = s.id
    GROUP BY s.id
    ORDER BY nb_absences DESC
  `);

  return { totalNonJustifiees, totalCeMois, topEmployes, parService };
}
async function getStatsEmploye(employeId) {
  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM absence WHERE employe_id = ? AND YEAR(date_debut) = YEAR(CURDATE())",
    [employeId]
  );
  const [[{ nonJustifiees }]] = await db.query(
    "SELECT COUNT(*) AS nonJustifiees FROM absence WHERE employe_id = ? AND statut = 'NON_JUSTIFIEE' AND YEAR(date_debut) = YEAR(CURDATE())",
    [employeId]
  );
  return { total, nonJustifiees };
}

async function getByEmployeAndDate(employeId, date) {
  const [rows] = await db.query(
    'SELECT * FROM absence WHERE employe_id = ? AND date_debut = ?',
    [employeId, date]
  );
  return rows[0];
}
async function getHistoriqueMensuel() {
  const [rows] = await db.query(`
    SELECT 
      DATE_FORMAT(date_debut, '%Y-%m') AS mois,
      COUNT(*) AS total,
      SUM(CASE WHEN statut = 'JUSTIFIEE' THEN 1 ELSE 0 END) AS justifiees,
      SUM(CASE WHEN statut = 'NON_JUSTIFIEE' THEN 1 ELSE 0 END) AS non_justifiees
    FROM absence
    WHERE date_debut >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(date_debut, '%Y-%m')
    ORDER BY mois ASC
  `);
  return rows;
}

async function getByMois(mois) {
  // mois au format 'YYYY-MM'
  const [rows] = await db.query(`
    SELECT a.*, e.nom AS employe_nom, e.prenom AS employe_prenom, s.nom AS service_nom
    FROM absence a
    JOIN employe e ON a.employe_id = e.id
    JOIN service s ON e.service_id = s.id
    WHERE DATE_FORMAT(a.date_debut, '%Y-%m') = ?
    ORDER BY a.date_debut DESC
  `, [mois]);
  return rows;
}
module.exports = { getAll, getById, getByEmployeId, create, update, getAllDetaille, getStats, getStatsEmploye, getByEmployeAndDate, getHistoriqueMensuel, getByMois };