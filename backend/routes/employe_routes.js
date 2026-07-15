const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employe_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

// Toutes les routes ci-dessous nécessitent d'être connecté
router.use(verifierToken);

router.get('/', employeController.getAll);
router.get('/:id', employeController.getById);
router.post('/', autoriserRoles('RH'), employeController.create);
router.put('/:id', autoriserRoles('RH'), employeController.update);
router.delete('/:id', autoriserRoles('RH'), employeController.remove);

module.exports = router;