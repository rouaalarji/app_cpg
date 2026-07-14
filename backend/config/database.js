// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();
const mysql = require('mysql2');
// Création d'un pool de connexions à la base de données

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
    // Nombre maximal de connexions simultanées dans le pool
  connectionLimit: 10,
  // nb maximal de requete en attente est attente illimitée 
  queueLimit: 0
});

// version "Promise" du pool, pour pouvoir utiliser async/await
const promisePool = pool.promise();

module.exports = promisePool;