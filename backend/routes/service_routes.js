const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);
// lien entre les requêtes envoyées par le frontend React et les fonctions du backend (contrôleurs).
// role de fichier service route est utilisé pour gérer les routes liées aux services dans l'application. Il utilise le middleware de vérification de token pour s'assurer que l'utilisateur est authentifié avant d'accéder aux routes. Certaines routes sont également protégées par le middleware d'autorisation des rôles, ce qui signifie que seuls les utilisateurs ayant les rôles spécifiés peuvent accéder à ces routes.
router.get('/mon-service', autoriserRoles('CHEF'), serviceController.getMonService);
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);
router.post('/', autoriserRoles('RH', 'ADMIN'), serviceController.create);
router.put('/:id', autoriserRoles('RH', 'ADMIN'), serviceController.update);
router.delete('/:id', autoriserRoles('RH', 'ADMIN'), serviceController.remove);

module.exports = router;