const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const { verifierToken } = require('../middleware/auth_middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/changer-mot-de-passe', verifierToken, authController.changerMotDePasse);
module.exports = router;