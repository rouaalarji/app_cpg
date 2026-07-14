const db = require('./config/database');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT NOW() AS heure_actuelle');
    console.log('Connexion réussie ! Heure serveur MySQL :', rows[0].heure_actuelle);
  } catch (err) {
    console.error('Erreur de connexion :', err.message);
  }
}

testConnection();