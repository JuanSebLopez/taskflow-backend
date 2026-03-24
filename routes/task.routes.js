const express = require('express');
const controller = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.post('/:id/move', controller.move);
router.post('/:id/clone', controller.clone);
router.post('/:id/comments', controller.comment);
router.patch('/:id/comments/:commentId', controller.editComment);
router.delete('/:id/comments/:commentId', controller.removeComment);
router.post('/:id/time-logs', controller.timeLog);

module.exports = router;
