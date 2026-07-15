const serviceModel = require('../models/service_model');

async function getAll(req, res) {
  try {
    const services = await serviceModel.getAll();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const service = await serviceModel.getById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { code, nom, departementId } = req.body;
    if (!code || !nom || !departementId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (code, nom, departementId)' });
    }
    const id = await serviceModel.create(req.body);
    res.status(201).json({ message: 'Service créé', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const service = await serviceModel.getById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    await serviceModel.update(req.params.id, req.body);
    res.json({ message: 'Service mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const service = await serviceModel.getById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    await serviceModel.remove(req.params.id);
    res.json({ message: 'Service supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove };