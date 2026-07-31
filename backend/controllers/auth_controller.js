const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const utilisateurModel = require('../models/utilisateur_model');

async function login(req, res) {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const utilisateur = await utilisateurModel.findByEmail(email);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    if (!utilisateur.actif) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function register(req, res) {
  try {
    const { email, motDePasse, role } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const utilisateurExistant = await utilisateurModel.findByEmail(email);
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const id = await utilisateurModel.create({ email, motDePasse: motDePasseHash, role: role || 'EMPLOYE' });

    res.status(201).json({ message: 'Utilisateur créé', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function changerMotDePasse(req, res) {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    if (nouveauMotDePasse.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const utilisateur = await utilisateurModel.findById(req.utilisateur.id);
    const valide = await bcrypt.compare(ancienMotDePasse, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);
    await utilisateurModel.updateMotDePasse(req.utilisateur.id, nouveauHash);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
module.exports = { login, register, changerMotDePasse };