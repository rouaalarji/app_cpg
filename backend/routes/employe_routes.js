const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employe_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/chefs', autoriserRoles('RH', 'ADMIN'), employeController.getChefs);
router.get('/mon-equipe', autoriserRoles('CHEF'), employeController.getMonEquipe);
router.get('/mon-profil', employeController.getMonProfil);
router.get('/', autoriserRoles('RH', 'ADMIN'), employeController.getAll);
router.get('/:id', employeController.getById);
router.post('/', autoriserRoles('ADMIN'), employeController.create);
router.put('/:id', autoriserRoles('ADMIN'), employeController.update);
router.delete('/:id', autoriserRoles('ADMIN'), employeController.remove);
router.get('/service/:serviceId', autoriserRoles('RH', 'ADMIN'), employeController.getByService);
router.get('/departement/:departementId', autoriserRoles('RH', 'ADMIN'), employeController.getByDepartement);

module.exports = router;