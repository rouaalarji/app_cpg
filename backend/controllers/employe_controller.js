const bcrypt = require('bcrypt');
const employeModel = require('../models/employe_model');
const utilisateurModel = require('../models/utilisateur_model');

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
    const {
      email, motDePasse, role,
      matricule, nom, prenom, dateNaissance, dateEmbauche, poste, serviceId, chefId
    } = req.body;

    if (!email || !motDePasse || !matricule || !nom || !prenom || !dateEmbauche || !poste || !serviceId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const utilisateurExistant = await utilisateurModel.findByEmail(email);
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // 1. Créer le compte utilisateur (connexion)
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const utilisateurId = await utilisateurModel.create({
      email,
      motDePasse: motDePasseHash,
      role: role || 'EMPLOYE',
    });

    // 2. Créer la fiche employé liée à ce compte
    const employeId = await employeModel.create({
      utilisateurId,
      matricule,
      nom,
      prenom,
      dateNaissance,
      dateEmbauche,
      poste,
      serviceId,
      chefId,
    });

    res.status(201).json({ message: 'Employé et compte créés', employeId, utilisateurId });
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

module.exports = { getAll, getById, create, update, remove };