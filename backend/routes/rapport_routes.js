const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapport_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);
router.get('/mensuel', autoriserRoles('RH', 'ADMIN'), rapportController.getRapportMensuel);

module.exports = router;