const departementModel = require('../models/departement_model');

async function getAll(req, res) {
  try {
    const departements = await departementModel.getAll();
    res.json(departements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const departement = await departementModel.getById(req.params.id);
    if (!departement) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }
    res.json(departement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { nom } = req.body;
    if (!nom) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }
    const id = await departementModel.create({ nom });
    res.status(201).json({ message: 'Département créé', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const departement = await departementModel.getById(req.params.id);
    if (!departement) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }
    await departementModel.update(req.params.id, req.body);
    res.json({ message: 'Département mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const departement = await departementModel.getById(req.params.id);
    if (!departement) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }
    await departementModel.remove(req.params.id);
    res.json({ message: 'Département supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove };