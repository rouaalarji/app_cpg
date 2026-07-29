const demandeCongeModel = require('../models/demande_conge_model');
const employeModel = require('../models/employe_model');

// Calcule le nombre de jours ouvrés entre deux dates (simplifié : tous les jours, sans exclure weekends/fériés)
function calculerNbJours(dateDebut, dateFin) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diffMs = fin - debut;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

async function getAll(req, res) {
  try {
    const demandes = await demandeCongeModel.getAll();
    res.json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json(demande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Un employé consulte ses propres demandes
async function getMesDemandes(req, res) {
  try {
    // req.utilisateur.id vient du token JWT, mais on a besoin de l'employe_id lié
    const [rows] = await require('../config/database').query(
      'SELECT id FROM employe WHERE utilisateur_id = ?',
      [req.utilisateur.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const demandes = await demandeCongeModel.getByEmployeId(rows[0].id);
    res.json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const { typeCongeId, dateDebut, dateFin, motif, adresseConge, telephoneConge } = req.body;

    if (!typeCongeId || !dateDebut || !dateFin) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;
    const nbJours = calculerNbJours(dateDebut, dateFin);

    // Vérification du solde disponible
    const typeConge = await typeCongeModel.getById(typeCongeId);
    if (!typeConge) {
      return res.status(404).json({ message: 'Type de congé introuvable' });
    }

    if (typeConge.nb_jours_par_an !== null) {
      const dejaUtilises = await demandeCongeModel.getJoursUtilisesCetteAnnee(employeId, typeCongeId);
      const soldeRestant = typeConge.nb_jours_par_an - dejaUtilises;

      if (nbJours > soldeRestant) {
        return res.status(400).json({
          message: `Solde insuffisant : il vous reste ${soldeRestant} jour(s) sur ${typeConge.nb_jours_par_an} pour "${typeConge.nom}", vous demandez ${nbJours} jour(s).`,
        });
      }
    }

    const pieceJustificative = req.file ? `/uploads/justificatifs/${req.file.filename}` : null;

    const id = await demandeCongeModel.create({
      employeId, typeCongeId, dateDebut, dateFin, nbJours, motif, adresseConge, telephoneConge, pieceJustificative,
    });
    res.status(201).json({ message: 'Demande de congé créée', id, nbJours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
// Validation niveau 1 (Chef)
async function validerParChef(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    if (demande.statut !== 'EN_ATTENTE') {
      return res.status(400).json({ message: `Impossible de valider : statut actuel = ${demande.statut}` });
    }

    // Récupérer l'employe_id du chef connecté
    const [rows] = await require('../config/database').query(
      'SELECT id FROM employe WHERE utilisateur_id = ?',
      [req.utilisateur.id]
    );
    const chefEmployeId = rows[0]?.id;

    // Vérifier que ce chef est bien le supérieur de l'employé concerné
    const employeConcerne = await employeModel.getById(demande.employe_id);
    if (employeConcerne.chef_id !== chefEmployeId) {
      return res.status(403).json({ message: "Vous n'êtes pas le responsable de cet employé" });
    }

    await demandeCongeModel.validerParChef(req.params.id, chefEmployeId);
    res.json({ message: 'Demande validée par le chef, en attente de validation RH' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Validation niveau 2 (RH) - validation finale
async function validerParRh(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    if (demande.statut !== 'VALIDE_CHEF') {
      return res.status(400).json({ message: `Impossible de valider : statut actuel = ${demande.statut}` });
    }

    const [rows] = await require('../config/database').query(
      'SELECT id FROM employe WHERE utilisateur_id = ?',
      [req.utilisateur.id]
    );
    const rhEmployeId = rows[0]?.id;

    await demandeCongeModel.validerParRh(req.params.id, rhEmployeId);
    res.json({ message: 'Demande validée définitivement par RH' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function refuser(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    if (demande.statut === 'VALIDE_RH' || demande.statut === 'REFUSE') {
      return res.status(400).json({ message: `Impossible de refuser : statut actuel = ${demande.statut}` });
    }

    await demandeCongeModel.refuser(req.params.id, req.body.commentaire);
    res.json({ message: 'Demande refusée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getMonEquipe(req, res) {
  try {
    const [rows] = await db.query('SELECT service_id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const demandes = await demandeCongeModel.getParServiceEnAttente(rows[0].service_id);
    res.json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function getSolde(req, res) {
  try {
    const { typeCongeId } = req.params;
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;

    const typeConge = await typeCongeModel.getById(typeCongeId);
    if (!typeConge) {
      return res.status(404).json({ message: 'Type de congé introuvable' });
    }

    if (typeConge.nb_jours_par_an === null) {
      return res.json({ illimite: true });
    }

    const dejaUtilises = await demandeCongeModel.getJoursUtilisesCetteAnnee(employeId, typeCongeId);
    res.json({
      illimite: false,
      total: typeConge.nb_jours_par_an,
      utilises: dejaUtilises,
      restant: typeConge.nb_jours_par_an - dejaUtilises,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
module.exports = { getAll, getById, getMesDemandes, create, validerParChef, validerParRh, refuser,getMonEquipe,getSolde };