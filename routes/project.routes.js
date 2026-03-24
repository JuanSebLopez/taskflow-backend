const express = require('express');
const controller = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateProjectCreate,
    validateProjectId,
    validateProjectMember,
    validateProjectUpdate
} = require('../validators/project.validator');

const router = express.Router();

router.use(protect);

router.get('/', controller.list);
router.post('/', validate({ body: validateProjectCreate }), controller.create);
router.get('/:id', validate({ params: validateProjectId }), controller.getById);
router.patch('/:id', validate({ params: validateProjectId, body: validateProjectUpdate }), controller.update);
router.delete('/:id', validate({ params: validateProjectId }), controller.remove);
router.post('/:id/members', validate({ params: validateProjectId, body: validateProjectMember }), controller.addMember);
router.post('/:id/archive', validate({ params: validateProjectId }), controller.archive);
router.post('/:id/clone', validate({ params: validateProjectId }), controller.clone);

module.exports = router;
