const jourFerieModel = require('../models/jour_ferie_model');

async function getAll(req, res) {
  try {
    const jours = await jourFerieModel.getAll();
    res.json(jours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getByMois(req, res) {
  try {
    const { annee, mois } = req.params;
    const jours = await jourFerieModel.getByMois(annee, mois);
    res.json(jours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getProchains(req, res) {
  try {
    const jours = await jourFerieModel.getProchains(5);
    res.json(jours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function verifierDate(req, res) {
  try {
    const jour = await jourFerieModel.getByDate(req.params.date);
    res.json({ estFerie: !!jour, details: jour || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { date, type, description } = req.body;
    if (!date) return res.status(400).json({ message: 'La date est requise' });
    const id = await jourFerieModel.create({ date, type, description });
    res.status(201).json({ message: 'Jour non travaillé ajouté', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Cette date est déjà marquée' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    await jourFerieModel.remove(req.params.id);
    res.json({ message: 'Jour non travaillé supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getByMois, getProchains, verifierDate, create, remove };