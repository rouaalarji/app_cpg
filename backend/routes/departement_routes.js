const express = require('express');
const router = express.Router();
const departementController = require('../controllers/departement_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', departementController.getAll);
router.get('/:id', departementController.getById);
router.post('/', autoriserRoles('RH','ADMIN'), departementController.create);
router.put('/:id', autoriserRoles('RH','ADMIN'), departementController.update);
router.delete('/:id', autoriserRoles('RH','ADMIN'), departementController.remove);

module.exports = router;