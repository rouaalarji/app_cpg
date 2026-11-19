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

async function getByEmployeId(employeId) {
  const [rows] = await db.query(
    'SELECT * FROM presence WHERE employe_id = ? ORDER BY date DESC',
    [employeId]
  );
  return rows;
}

async function create({ employeId, date, heureArrivee, heureDepart, statut }) {
  const [result] = await db.query(
    `INSERT INTO presence (employe_id, date, heure_arrivee, heure_depart, statut)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       heure_arrivee = COALESCE(VALUES(heure_arrivee), heure_arrivee),
       heure_depart = COALESCE(VALUES(heure_depart), heure_depart),
       statut = VALUES(statut)`,
    [employeId, date, heureArrivee || null, heureDepart || null, statut || 'PRESENT']
  );
  return result.insertId || null;
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

async function getGrilleParService(serviceId, dateDebut, dateFin) {
  const [employes] = await db.query(
    `SELECT id, nom, prenom, matricule
     FROM employe
     WHERE service_id = ?
     ORDER BY nom`,
    [serviceId]
  );

  const [presences] = await db.query(
    `SELECT employe_id, date, statut, heure_arrivee, heure_depart
     FROM presence
     WHERE employe_id IN (SELECT id FROM employe WHERE service_id = ?)
       AND date BETWEEN ? AND ?`,
    [serviceId, dateDebut, dateFin]
  );

  return { employes, presences };
}
async function getStatsMois(mois) {
  // mois au format 'YYYY-MM'
  const [[totaux]] = await db.query(`
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN statut = 'PRESENT' THEN 1 ELSE 0 END) AS presents,
      SUM(CASE WHEN statut = 'RETARD' THEN 1 ELSE 0 END) AS retards,
      SUM(CASE WHEN statut = 'ABSENT' THEN 1 ELSE 0 END) AS absents
    FROM presence
    WHERE DATE_FORMAT(date, '%Y-%m') = ?
  `, [mois]);

  const [parService] = await db.query(`
    SELECT s.nom AS service_nom,
      SUM(CASE WHEN p.statut = 'PRESENT' THEN 1 ELSE 0 END) AS presents,
      SUM(CASE WHEN p.statut = 'RETARD' THEN 1 ELSE 0 END) AS retards,
      SUM(CASE WHEN p.statut = 'ABSENT' THEN 1 ELSE 0 END) AS absents
    FROM presence p
    JOIN employe e ON p.employe_id = e.id
    JOIN service s ON e.service_id = s.id
    WHERE DATE_FORMAT(p.date, '%Y-%m') = ?
    GROUP BY s.id
    ORDER BY absents DESC
  `, [mois]);

  return { mois, ...totaux, parService };
}
module.exports = { getAll, getById, getByEmployeId, getGrilleParService,  create, updateHeureDepart, update, getStatsMois };