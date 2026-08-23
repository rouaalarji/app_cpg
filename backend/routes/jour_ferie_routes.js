const express = require('express');
const router = express.Router();
const jourFerieController = require('../controllers/jour_ferie_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', jourFerieController.getAll);
router.get('/prochains', jourFerieController.getProchains);
router.get('/verifier/:date', jourFerieController.verifierDate);
router.get('/mois/:annee/:mois', jourFerieController.getByMois);
router.post('/', autoriserRoles('RH', 'ADMIN'), jourFerieController.create);
router.delete('/:id', autoriserRoles('RH', 'ADMIN'), jourFerieController.remove);

module.exports = router;