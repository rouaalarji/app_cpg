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
    const employeId = rows[0].id;

    const { dateDebut, dateFin, motif } = req.body;
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (dateDebut, dateFin)' });
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const justificatif = req.file ? `/uploads/justificatifs/${req.file.filename}` : null;

    // Si une absence existe déjà pour cet employé à cette date (créée par le pointage du chef),
    // on la complète avec la déclaration de l'employé au lieu de dupliquer
    const absenceExistante = await absenceModel.getByEmployeAndDate(employeId, dateDebut);

    if (absenceExistante) {
      await absenceModel.update(absenceExistante.id, {
        motif: motif || absenceExistante.motif,
        justificatif: justificatif || absenceExistante.justificatif,
        statut: justificatif ? 'JUSTIFIEE' : absenceExistante.statut,
      });
      await absenceModel.marquerDeclaree(absenceExistante.id);
      return res.status(200).json({ message: 'Déclaration ajoutée à votre absence', id: absenceExistante.id });
    }

    const id = await absenceModel.create({
      employeId,
      dateDebut,
      dateFin,
      motif,
      justificatif,
      statut: justificatif ? 'JUSTIFIEE' : 'NON_JUSTIFIEE',
    });
    await absenceModel.marquerDeclaree(id);

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
async function getAllAdmin(req, res) {
  try {
    const absences = await absenceModel.getAllDetaille();
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getStats(req, res) {
  try {
    const stats = await absenceModel.getStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getMesStats(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const stats = await absenceModel.getStatsEmploye(rows[0].id);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getHistoriqueMensuel(req, res) {
  try {
    const historique = await absenceModel.getHistoriqueMensuel();
    res.json(historique);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getByMois(req, res) {
  try {
    const { mois } = req.params; // format YYYY-MM
    const absences = await absenceModel.getByMois(mois);
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function declarerSurExistante(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;

    const absence = await absenceModel.getById(req.params.id);
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    if (absence.employe_id !== employeId) {
      return res.status(403).json({ message: "Cette absence ne vous appartient pas" });
    }

    const { motif } = req.body;
    const justificatif = req.file ? `/uploads/justificatifs/${req.file.filename}` : absence.justificatif;

    await absenceModel.update(req.params.id, {
      motif: motif || absence.motif,
      justificatif,
      statut: justificatif ? 'JUSTIFIEE' : absence.statut,
    });
    await absenceModel.marquerDeclaree(req.params.id);

    res.json({ message: 'Déclaration enregistrée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
module.exports = { getAll, getMesAbsences, create, update, getAllAdmin, getStats, getMesStats, getHistoriqueMensuel, getByMois, declarerSurExistante };