const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification_controller');
const { verifierToken } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', notificationController.getMesNotifications);
router.patch('/:id/lue', notificationController.marquerLue);
router.patch('/toutes-lues', notificationController.marquerToutesLues);

module.exports = router;