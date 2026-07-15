const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absence_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', autoriserRoles('RH', 'CHEF'), absenceController.getAll);
router.get('/mes-absences', absenceController.getMesAbsences);
router.post('/', absenceController.create);
router.put('/:id', autoriserRoles('RH', 'CHEF'), absenceController.update);

module.exports = router;