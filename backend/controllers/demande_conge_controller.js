const demandeCongeModel = require('../models/demande_conge_model');
const employeModel = require('../models/employe_model');
const typeCongeModel = require('../models/type_conge_model');
const serviceModel = require('../models/service_model');
const notificationModel = require('../models/notification_model');
const db = require('../config/database');

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

async function getMesDemandes(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
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

    const [rows] = await db.query('SELECT id, service_id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;
    const nbJours = calculerNbJours(dateDebut, dateFin);

    // Vérification de chevauchement avec une demande existante
    const chevauchements = await demandeCongeModel.getChevauchement(employeId, dateDebut, dateFin);
    if (chevauchements.length > 0) {
      return res.status(409).json({
        message: `Vous avez déjà une demande de congé sur cette période (${chevauchements[0].date_debut} → ${chevauchements[0].date_fin}, statut: ${chevauchements[0].statut}).`,
      });
    }

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

    // Un Chef ou Admin qui fait sa propre demande saute l'étape de validation Chef (il ne peut pas s'auto-valider)
    const statutInitial = (req.utilisateur.role === 'CHEF' || req.utilisateur.role === 'ADMIN') ? 'VALIDE_CHEF' : 'EN_ATTENTE';

    const id = await demandeCongeModel.create({
      employeId, typeCongeId, dateDebut, dateFin, nbJours, motif, adresseConge, telephoneConge, pieceJustificative, statutInitial,
    });

    // Notifier le chef du service si la demande attend son avis
    if (statutInitial === 'EN_ATTENTE') {
      const service = await serviceModel.getById(rows[0].service_id);
      if (service?.chef_id) {
        const [chefUser] = await db.query('SELECT utilisateur_id FROM employe WHERE id = ?', [service.chef_id]);
        if (chefUser[0]) {
          await notificationModel.create({
            utilisateurId: chefUser[0].utilisateur_id,
            titre: 'Nouvelle demande de congé',
            message: 'Une demande de congé attend votre validation.',
            lien: '/chef/validation-conges',
          });
        }
      }
    }

    res.status(201).json({ message: 'Demande de congé créée', id, nbJours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Annuler une demande (uniquement si EN_ATTENTE et appartient à l'employé connecté)
async function annuler(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;

    const succes = await demandeCongeModel.annuler(req.params.id, employeId);
    if (!succes) {
      return res.status(400).json({ message: "Impossible d'annuler (déjà traitée ou introuvable)" });
    }
    res.json({ message: 'Demande annulée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function validerParChef(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    if (demande.statut !== 'EN_ATTENTE') {
      return res.status(400).json({ message: `Impossible de valider : statut actuel = ${demande.statut}` });
    }

    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const chefEmployeId = rows[0].id;

    const service = await serviceModel.getServiceParResponsable(chefEmployeId);
    if (!service) {
      return res.status(403).json({ message: "Vous n'êtes chef d'aucun service actuellement" });
    }

    const employeConcerne = await employeModel.getById(demande.employe_id);
    if (employeConcerne.service_id !== service.id) {
      return res.status(403).json({ message: "Cette demande ne concerne pas votre service" });
    }

    await demandeCongeModel.validerParChef(req.params.id, chefEmployeId);

    // Notifier l'employé
    const [empUser] = await db.query('SELECT utilisateur_id FROM employe WHERE id = ?', [demande.employe_id]);
    if (empUser[0]) {
      await notificationModel.create({
        utilisateurId: empUser[0].utilisateur_id,
        titre: 'Congé validé par votre chef',
        message: 'Votre demande de congé est en attente de validation RH.',
        lien: '/employe/mes-conges',
      });
    }

    res.json({ message: 'Demande validée par le chef, en attente de validation RH' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function validerParRh(req, res) {
  try {
    const demande = await demandeCongeModel.getById(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    if (demande.statut !== 'VALIDE_CHEF') {
      return res.status(400).json({ message: `Impossible de valider : la demande doit d'abord être validée par le chef (statut actuel = ${demande.statut})` });
    }

    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    const rhEmployeId = rows[0]?.id;

    await demandeCongeModel.validerParRh(req.params.id, rhEmployeId);

    // Notifier l'employé
    const [empUser] = await db.query('SELECT utilisateur_id FROM employe WHERE id = ?', [demande.employe_id]);
    if (empUser[0]) {
      await notificationModel.create({
        utilisateurId: empUser[0].utilisateur_id,
        titre: 'Congé validé définitivement',
        message: 'Votre demande de congé a été validée par les Ressources Humaines.',
        lien: '/employe/mes-conges',
      });
    }

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

    // Notifier l'employé
    const [empUser] = await db.query('SELECT utilisateur_id FROM employe WHERE id = ?', [demande.employe_id]);
    if (empUser[0]) {
      await notificationModel.create({
        utilisateurId: empUser[0].utilisateur_id,
        titre: 'Demande de congé refusée',
        message: req.body.commentaire ? `Motif : ${req.body.commentaire}` : 'Votre demande a été refusée.',
        lien: '/employe/mes-conges',
      });
    }

    res.json({ message: 'Demande refusée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getMonEquipe(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const monEmployeId = rows[0].id;

    const service = await serviceModel.getServiceParResponsable(monEmployeId);
    if (!service) {
      return res.status(403).json({ message: "Vous n'êtes chef d'aucun service actuellement" });
    }

    const demandes = await demandeCongeModel.getParServiceEnAttente(service.id);
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

async function getResumePersonnel(req, res) {
  try {
    const [rows] = await db.query('SELECT id FROM employe WHERE utilisateur_id = ?', [req.utilisateur.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    const employeId = rows[0].id;

    const [[{ enAttente }]] = await db.query(
      "SELECT COUNT(*) AS enAttente FROM demande_conge WHERE employe_id = ? AND statut IN ('EN_ATTENTE', 'VALIDE_CHEF')",
      [employeId]
    );

    const prochainConge = await demandeCongeModel.getProchainCongeValide(employeId);

    res.json({ enAttente, prochainConge });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
module.exports = { getAll, getById, getMesDemandes, create, annuler, validerParChef, validerParRh, refuser, getMonEquipe, getSolde, getResumePersonnel };