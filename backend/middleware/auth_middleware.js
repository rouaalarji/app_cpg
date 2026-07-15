// cette fichier est pour gerer aythetification et empecher les utilisatuers non autorisés d'acceder aux routes
const jwt = require('jsonwebtoken');

// Vérifie que le token JWT est présent et valide
function verifierToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Le header est du type "Bearer eyJhbGci..."
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded; // on attache les infos décodées à la requête
    next(); // on passe à la suite (le controller)
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
}

// Vérifie que l'utilisateur a un des rôles autorisés
function autoriserRoles(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès refusé pour ce rôle' });
    }
    next();
  };
}

module.exports = { verifierToken, autoriserRoles };