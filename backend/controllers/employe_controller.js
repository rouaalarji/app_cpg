const db = require('../config/database');
const bcrypt = require('bcrypt');
const employeModel = require('../models/employe_model');
const utilisateurModel = require('../models/utilisateur_model');
const serviceModel = require('../models/service_model');
async function getAll(req, res) {
  try {
    const employes = await employeModel.getAll();
    res.json(employes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json(employe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { typeCongeId, dateDebut, dateFin, motif, adresseConge, telephoneConge } = req.body;

    if (!typeCongeId || !dateDebut || !dateFin) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;
    const nbJours = calculerNbJours(dateDebut, dateFin);
    const pieceJustificative = req.file ? `/uploads/justificatifs/${req.file.filename}` : null;

    const id = await demandeCongeModel.create({
      employeId, typeCongeId, dateDebut, dateFin, nbJours, motif, adresseConge, telephoneConge, pieceJustificative,
    });
    res.status(201).json({ message: 'Demande de congé créée', id, nbJours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function update(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    await employeModel.update(req.params.id, req.body);
    res.json({ message: 'Employé mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    await employeModel.remove(req.params.id);
    res.json({ message: 'Employé supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getMonEquipe(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const monEmployeId = rows[0].id;

    const service = await serviceModel.getServiceParResponsable(monEmployeId);
    if (!service) {
      return res.status(403).json({ message: "Vous n'êtes chef d'aucun service actuellement" });
    }

    const date = req.query.date || new Date().toISOString().split('T')[0];
    const equipe = await employeModel.getByServiceIdAvecPresence(service.id, date);
    res.json(equipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getChefs(req, res) {
  try {
    const chefs = await employeModel.getEmployesAvecRoleChef();
    res.json(chefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getMonProfil(req, res) {
  try {
    const profil = await employeModel.getProfilComplet(req.utilisateur.id);
    if (!profil) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    res.json(profil);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
module.exports = { getAll, getById, create, update, remove, getMonEquipe, getChefs, getMonProfil};