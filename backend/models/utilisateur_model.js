const db = require('../config/database');

// Trouver un utilisateur par son email (utilisé au login)
async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
  return rows[0]; // undefined si aucun utilisateur trouvé
}

// Trouver un utilisateur par son id
async function findById(id) {
  const [rows] = await db.query('SELECT * FROM utilisateur WHERE id = ?', [id]);
  return rows[0];
}

// Créer un nouvel utilisateur (le mot de passe doit déjà être hashé avant d'arriver ici)
async function create({ email, motDePasse, role }) {
  const [result] = await db.query(
    'INSERT INTO utilisateur (email, mot_de_passe, role) VALUES (?, ?, ?)',
    [email, motDePasse, role]
  );
  return result.insertId;
}
async function getAll() {
  const [rows] = await db.query(`
    SELECT 
      u.id, u.email, u.role, u.actif, u.date_creation,
      e.id AS employe_id
    FROM utilisateur u
    LEFT JOIN employe e ON e.utilisateur_id = u.id
    ORDER BY u.date_creation DESC
  `);
  return rows;
}
async function getAll() {
  const [rows] = await db.query(`
    SELECT 
      u.id, u.email, u.role, u.actif, u.date_creation,
      e.id AS employe_id
    FROM utilisateur u
    LEFT JOIN employe e ON e.utilisateur_id = u.id
    ORDER BY u.date_creation DESC
  `);
  return rows;
}

async function updateRole(id, role) {
  await db.query('UPDATE utilisateur SET role = ? WHERE id = ?', [role, id]);
}

async function updateStatut(id, actif) {
  await db.query('UPDATE utilisateur SET actif = ? WHERE id = ?', [actif, id]);
}
module.exports = { findByEmail, findById, create, getAll, updateRole, updateStatut };