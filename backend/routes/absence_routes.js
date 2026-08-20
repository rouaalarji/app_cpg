const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absence_controller');
const upload = require('../middleware/upload_middleware');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', autoriserRoles('RH', 'CHEF'), absenceController.getAll);
router.get('/mes-absences', absenceController.getMesAbsences);
router.get('/admin', autoriserRoles('RH', 'ADMIN'), absenceController.getAllAdmin);
router.get('/stats', autoriserRoles('RH', 'ADMIN'), absenceController.getStats);
router.get('/mes-stats', absenceController.getMesStats);
router.get('/historique-mensuel', absenceController.getHistoriqueMensuel);
router.get('/mois/:mois', absenceController.getByMois);
router.post('/', upload.single('justificatif'), absenceController.create);
router.put('/:id', autoriserRoles('RH', 'CHEF', 'ADMIN'), absenceController.update);
router.put('/:id/declarer', upload.single('justificatif'), absenceController.declarerSurExistante);
module.exports = router;