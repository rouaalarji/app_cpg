const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service_controller');
const { verifierToken, autoriserRoles } = require('../middleware/auth_middleware');

router.use(verifierToken);

router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);
router.post('/', autoriserRoles('RH'), serviceController.create);
router.put('/:id', autoriserRoles('RH'), serviceController.update);
router.delete('/:id', autoriserRoles('RH'), serviceController.remove);

module.exports = router;