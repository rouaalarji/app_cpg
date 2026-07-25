const utilisateurModel = require('../models/utilisateur_model');

async function getAll(req, res) {
  try {
    const comptes = await utilisateurModel.getAll();
    res.json(comptes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function updateRole(req, res) {
  try {
    const { role } = req.body;
    const rolesValides = ['EMPLOYE', 'CHEF', 'RH', 'ADMIN'];
    if (!rolesValides.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }
    await utilisateurModel.updateRole(req.params.id, role);
    res.json({ message: 'Rôle mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function updateStatut(req, res) {
  try {
    const { actif } = req.body;
    await utilisateurModel.updateStatut(req.params.id, actif);
    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, updateRole, updateStatut };