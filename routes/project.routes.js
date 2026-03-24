const express = require('express');
const controller = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/members', controller.addMember);
router.post('/:id/archive', controller.archive);
router.post('/:id/clone', controller.clone);

module.exports = router;
