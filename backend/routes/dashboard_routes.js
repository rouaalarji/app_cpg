const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);
router.get('/stats', autoriserRoles('RH', 'ADMIN'), dashboardController.getStats);

module.exports = router;