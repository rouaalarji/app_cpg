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
    if (!type) return res.status(404).json({ message: 'Type de congé non trouvé' });
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { code, nom, nbJoursParAn } = req.body;
    if (!code || !nom) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (code, nom)' });
    }
    const id = await typeCongeModel.create(req.body);
    res.status(201).json({ message: 'Type de congé créé', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce code existe déjà' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const type = await typeCongeModel.getById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type de congé non trouvé' });
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
    if (!type) return res.status(404).json({ message: 'Type de congé non trouvé' });
    await typeCongeModel.remove(req.params.id);
    res.json({ message: 'Type de congé supprimé' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Impossible de supprimer : des demandes de congé utilisent ce type' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove };