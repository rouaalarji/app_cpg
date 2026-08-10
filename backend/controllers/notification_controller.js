const notificationModel = require('../models/notification_model');

async function getMesNotifications(req, res) {
  try {
    const notifications = await notificationModel.getByUtilisateur(req.utilisateur.id);
    const nonLues = await notificationModel.getNombreNonLues(req.utilisateur.id);
    res.json({ notifications, nonLues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function marquerLue(req, res) {
  try {
    await notificationModel.marquerLue(req.params.id, req.utilisateur.id);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function marquerToutesLues(req, res) {
  try {
    await notificationModel.marquerToutesLues(req.utilisateur.id);
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getMesNotifications, marquerLue, marquerToutesLues };