const serviceModel = require('../models/service_model');
const db = require('../config/database');
/*
 * ROLE DU CONTROLLER :
 * Le Controller représente l'intermédiaire entre les routes et le modèle.
 * Il reçoit les requêtes envoyées par le frontend à travers les routes,
 * récupère les données, effectue les vérifications nécessaires,
 * appelle les fonctions du modèle pour communiquer avec la base de données,
 * puis renvoie une réponse au frontend (succès ou erreur).
 */
async function getAll(req, res) {
  try {
        // Appeler le modèle pour récupérer tous les services avec leurs détails
    const services = await serviceModel.getAllDetaille();
        // Envoyer la liste des services au frontend au format JSON

    res.json(services);
  } catch (err) {
    console.error(err);
        // Renvoyer une erreur 500 au frontend en cas de problème

    res.status(500).json({ message: 'Erreur serveur' });
  }
}
// Fonction pour récupérer un service selon son identifiant

async function getById(req, res) {
  try {
        // Récupérer l'identifiant du service depuis les paramètres de l'URL

    const service = await serviceModel.getById(req.params.id);
        // Vérifier si le service existe
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
        // Renvoyer les informations du service au frontend

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
// Fonction pour créer un nouveau service

async function create(req, res) {
  try {
        // Récupérer les données envoyées par le frontend dans le corps de la requête
    const { code, nom, departementId } = req.body;
        // Vérifier que tous les champs obligatoires sont renseignés

    if (!code || !nom || !departementId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (code, nom, departementId)' });
    }
        // Appeler le modèle pour enregistrer le nouveau service dans la base de données

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
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    await serviceModel.remove(req.params.id);
    res.json({ message: 'Service supprimé' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Impossible de supprimer : des employés sont rattachés à ce service' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
// Fonction pour récupérer le service du chef connecté
async function getMonService(req, res) {
  try {
        // Récupérer l'identifiant de l'employé associé à l'utilisateur connecté

    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
        // Récupérer les détails du service dont cet employé est responsable

    const detail = await serviceModel.getDetailParResponsable(rows[0].id);
    if (!detail) {
      return res.status(403).json({ message: "Vous n'êtes chef d'aucun service actuellement" });
    }
    res.json(detail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove, getMonService };