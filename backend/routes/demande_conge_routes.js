const express = require('express');
const router = express.Router();
const demandeCongeController = require('../controllers/demande_conge_controller');
const upload = require('../middleware/upload_middleware');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', autoriserRoles('RH', 'ADMIN'), demandeCongeController.getAll);
router.get('/mes-demandes', demandeCongeController.getMesDemandes);
router.get('/solde/:typeCongeId', demandeCongeController.getSolde);
router.get('/mon-equipe', autoriserRoles('CHEF'), demandeCongeController.getMonEquipe);
router.get('/:id', demandeCongeController.getById);
router.post('/', upload.single('pieceJustificative'), demandeCongeController.create);
router.patch('/:id/valider-chef', autoriserRoles('CHEF'), demandeCongeController.validerParChef);
router.patch('/:id/valider-rh', autoriserRoles('RH', 'ADMIN'), demandeCongeController.validerParRh);
router.patch('/:id/refuser', autoriserRoles('CHEF', 'RH', 'ADMIN'), demandeCongeController.refuser);

module.exports = router;