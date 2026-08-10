const db = require('../config/database');

async function getByUtilisateur(utilisateurId) {
  const [rows] = await db.query(
    'SELECT * FROM notification WHERE utilisateur_id = ? ORDER BY date_creation DESC LIMIT 30',
    [utilisateurId]
  );
  return rows;
}

async function getNombreNonLues(utilisateurId) {
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) AS total FROM notification WHERE utilisateur_id = ? AND lue = FALSE',
    [utilisateurId]
  );
  return total;
}

async function create({ utilisateurId, titre, message, lien }) {
  const [result] = await db.query(
    'INSERT INTO notification (utilisateur_id, titre, message, lien) VALUES (?, ?, ?, ?)',
    [utilisateurId, titre, message, lien || null]
  );
  return result.insertId;
}

async function marquerLue(id, utilisateurId) {
  await db.query(
    'UPDATE notification SET lue = TRUE WHERE id = ? AND utilisateur_id = ?',
    [id, utilisateurId]
  );
}

async function marquerToutesLues(utilisateurId) {
  await db.query('UPDATE notification SET lue = TRUE WHERE utilisateur_id = ?', [utilisateurId]);
}

module.exports = { getByUtilisateur, getNombreNonLues, create, marquerLue, marquerToutesLues };