const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);
router.use(autoriserRoles('ADMIN'));

router.get('/', utilisateurController.getAll);
router.patch('/:id/role', utilisateurController.updateRole);
router.patch('/:id/statut', utilisateurController.updateStatut);

module.exports = router;