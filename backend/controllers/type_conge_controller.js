const typeCongeModel = require('../models/type_conge_model');

async function getAll(req, res) {
  try {
    const types = await typeCongeModel.getAll();
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const type = await typeCongeModel.getById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type de congé non trouvé' });
    }
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { nom, nbJoursParAn } = req.body;
    if (!nom || nbJoursParAn === undefined) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (nom, nbJoursParAn)' });
    }
    const id = await typeCongeModel.create(req.body);
    res.status(201).json({ message: 'Type de congé créé', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const type = await typeCongeModel.getById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type de congé non trouvé' });
    }
    await typeCongeModel.update(req.params.id, req.body);
    res.json({ message: 'Type de congé mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const type = await typeCongeModel.getById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type de congé non trouvé' });
    }
    await typeCongeModel.remove(req.params.id);
    res.json({ message: 'Type de congé supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove };