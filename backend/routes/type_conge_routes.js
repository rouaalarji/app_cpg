const express = require('express');
const router = express.Router();
const typeCongeController = require('../controllers/type_conge_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', typeCongeController.getAll);
router.get('/:id', typeCongeController.getById);
router.post('/', autoriserRoles('RH'), typeCongeController.create);
router.put('/:id', autoriserRoles('RH'), typeCongeController.update);
router.delete('/:id', autoriserRoles('RH'), typeCongeController.remove);

module.exports = router;