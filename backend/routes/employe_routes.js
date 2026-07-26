const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employe_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/chefs', autoriserRoles('RH', 'ADMIN'), employeController.getChefs);
router.get('/mon-equipe', autoriserRoles('CHEF'), employeController.getMonEquipe);
router.get('/', autoriserRoles('RH', 'ADMIN'), employeController.getAll);
router.get('/:id', employeController.getById);
router.post('/', autoriserRoles('RH', 'ADMIN'), employeController.create);
router.put('/:id', autoriserRoles('RH', 'ADMIN'), employeController.update);
router.delete('/:id', autoriserRoles('RH', 'ADMIN'), employeController.remove);

module.exports = router;