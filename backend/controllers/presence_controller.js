const presenceModel = require('../models/presence_model');
const db = require('../config/database');

async function getAll(req, res) {
  try {
    const presences = await presenceModel.getAll();
    res.json(presences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getMesPresences(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const presences = await presenceModel.getByEmployeId(rows[0].id);
    res.json(presences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Check-in : pointage d'arrivée
async function checkIn(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;
    const aujourdHui = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

    const dejaPointe = await presenceModel.getByEmployeAndDate(employeId, aujourdHui);
    if (dejaPointe) {
      return res.status(409).json({ message: "Vous avez déjà pointé aujourd'hui" });
    }

    const heureActuelle = new Date().toTimeString().split(' ')[0]; // format HH:MM:SS
    const id = await presenceModel.create({
      employeId,
      date: aujourdHui,
      heureArrivee: heureActuelle,
      statut: 'PRESENT',
    });

    res.status(201).json({ message: 'Pointage enregistré', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Check-out : pointage de départ
async function checkOut(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;
    const aujourdHui = new Date().toISOString().split('T')[0];

    const presenceDuJour = await presenceModel.getByEmployeAndDate(employeId, aujourdHui);
    if (!presenceDuJour) {
      return res.status(400).json({ message: "Vous n'avez pas encore pointé votre arrivée aujourd'hui" });
    }

    const heureActuelle = new Date().toTimeString().split(' ')[0];
    await presenceModel.updateHeureDepart(presenceDuJour.id, heureActuelle);

    res.json({ message: 'Départ enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// RH/Chef : saisie manuelle d'une présence pour un employé
async function create(req, res) {
  try {
    const { employeId, date, heureArrivee, heureDepart, statut } = req.body;
    if (!employeId || !date) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (employeId, date)' });
    }
    const id = await presenceModel.create({ employeId, date, heureArrivee, heureDepart, statut });
    res.status(201).json({ message: 'Présence enregistrée', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getMesPresences, checkIn, checkOut, create };