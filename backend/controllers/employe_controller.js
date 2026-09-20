const bcrypt = require('bcrypt');
const employeModel = require('../models/employe_model');
const utilisateurModel = require('../models/utilisateur_model');
const serviceModel = require('../models/service_model');
const db = require('../config/database');

async function getAll(req, res) {
  try {
    const employes = await employeModel.getAll();
    res.json(employes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getById(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json(employe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function create(req, res) {
  try {
    const {
      email, motDePasse, role,
      nom, prenom, dateNaissance, dateEmbauche, serviceId
    } = req.body;

    if (!email || !motDePasse || !nom || !prenom || !dateEmbauche || !serviceId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const utilisateurExistant = await utilisateurModel.findByEmail(email);
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    if (role === 'CHEF') {
      const serviceCible = await serviceModel.getById(serviceId);
      if (!serviceCible) {
        return res.status(404).json({ message: 'Service introuvable' });
      }
      if (serviceCible.chef_id) {
        return res.status(409).json({
          message: 'Ce service a déjà un chef assigné. Retirez-le d\'abord avant d\'en affecter un nouveau.'
        });
      }
    }

    const dernierMatricule = await employeModel.getDernierMatricule();
    const matricule = employeModel.genererProchainMatricule(dernierMatricule);

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const utilisateurId = await utilisateurModel.create({
      email,
      motDePasse: motDePasseHash,
      role: role || 'EMPLOYE',
    });

    const employeId = await employeModel.create({
      utilisateurId,
      matricule,
      nom,
      prenom,
      dateNaissance,
      dateEmbauche,
      serviceId,
    });

    if (role === 'CHEF') {
      await serviceModel.assignerChef(serviceId, employeId);
    }

    res.status(201).json({ message: 'Employé et compte créés', employeId, utilisateurId, matricule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function update(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const { nom, prenom, dateNaissance, serviceId, statut, role } = req.body;
    const ancienRole = employe.role; // récupéré grâce au JOIN dans getById

    // Si on assigne (ou garde) le rôle CHEF, vérifie que le service ciblé est libre
    if (role === 'CHEF' && serviceId) {
      const serviceCible = await serviceModel.getById(serviceId);
      if (!serviceCible) {
        return res.status(404).json({ message: 'Service introuvable' });
      }
      if (serviceCible.chef_id && serviceCible.chef_id !== parseInt(req.params.id, 10)) {
        return res.status(409).json({
          message: 'Ce service a déjà un chef assigné. Retirez-le d\'abord avant d\'en affecter un nouveau.'
        });
      }
    }

    // Met à jour les champs de la table employe
    await employeModel.update(req.params.id, req.body);

    // Met à jour le rôle dans la table utilisateur, si un rôle a été envoyé et qu'il a changé
    if (role && role !== ancienRole) {
      await utilisateurModel.updateRole(employe.utilisateur_id, role);
    }

    // Synchronise service.chef_id selon le rôle final
    const roleFinal = role || ancienRole;
    if (roleFinal === 'CHEF' && serviceId) {
      await serviceModel.retirerChef(req.params.id); // retire son ancien poste de chef s'il y en avait un
      await serviceModel.assignerChef(serviceId, req.params.id);
    } else if (roleFinal !== 'CHEF') {
      await serviceModel.retirerChef(req.params.id);
    }

    res.json({ message: 'Employé mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function remove(req, res) {
  try {
    const employe = await employeModel.getById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    await employeModel.remove(req.params.id);
    res.json({ message: 'Employé supprimé' });
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

    const date = req.query.date || new Date().toISOString().split('T')[0];
    const equipe = await employeModel.getByServiceIdAvecPresence(service.id, date, monEmployeId);
    res.json(equipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getChefs(req, res) {
  try {
    const chefs = await employeModel.getEmployesAvecRoleChef();
    res.json(chefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getMonProfil(req, res) {
  try {
    const profil = await employeModel.getProfilComplet(req.utilisateur.id);
    if (!profil) {
      return res.status(404).json({ message: 'Profil employé introuvable' });
    }
    res.json(profil);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}async function getByService(req, res) {
  try {
    const employes = await employeModel.getByServiceId(req.params.serviceId);
    res.json(employes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getByDepartement(req, res) {
  try {
    const employes = await employeModel.getByDepartementId(req.params.departementId);
    res.json(employes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getAll, getById, create, update, remove, getMonEquipe, getChefs, getMonProfil, getByService, getByDepartement };