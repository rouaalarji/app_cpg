const absenceModel = require('../models/absence_model');
const db = require('../config/database');

async function getAll(req, res) {
  try {
    const absences = await absenceModel.getAll();
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getMesAbsences(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const absences = await absenceModel.getByEmployeId(rows[0].id);
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }

    const { dateDebut, dateFin, motif, justificatif } = req.body;
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (dateDebut, dateFin)' });
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const id = await absenceModel.create({
      employeId: rows[0].id,
      dateDebut,
      dateFin,
      motif,
      justificatif,
      statut: justificatif ? 'JUSTIFIEE' : 'NON_JUSTIFIEE',
    });

    res.status(201).json({ message: 'Absence déclarée', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// RH/Chef requalifie une absence (ex: justificatif reçu après coup)
async function update(req, res) {
  try {
    const absence = await absenceModel.getById(req.params.id);
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    await absenceModel.update(req.params.id, req.body);
    res.json({ message: 'Absence mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getMesAbsences, create, update };