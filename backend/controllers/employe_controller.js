const employeModel = require('../models/employe_model');

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
    const { matricule, nom, prenom, dateEmbauche, poste, serviceId } = req.body;

    if (!matricule || !nom || !prenom || !dateEmbauche || !poste || !serviceId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const id = await employeModel.create(req.body);
    res.status(201).json({ message: 'Employé créé', id });
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