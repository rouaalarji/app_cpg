const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presence_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', autoriserRoles('RH', 'CHEF'), presenceController.getAll);
router.get('/mes-presences', presenceController.getMesPresences);
router.post('/check-in', presenceController.checkIn);
router.post('/check-out', presenceController.checkOut);
router.post('/', autoriserRoles('RH', 'CHEF'), presenceController.create);
router.get('/employe/:employeId', autoriserRoles('RH', 'CHEF'), presenceController.getByEmploye);
module.exports = router;