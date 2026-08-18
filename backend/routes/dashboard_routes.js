const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);
router.get('/stats', autoriserRoles('RH', 'ADMIN'), dashboardController.getStats);
router.get('/stats-chef', autoriserRoles('CHEF'), dashboardController.getStatsChef);
router.get('/demandes-conge-equipe', autoriserRoles('CHEF'), dashboardController.getDemandesConge);
module.exports = router;