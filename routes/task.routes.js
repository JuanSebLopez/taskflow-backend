const express = require('express');
const controller = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateComment,
    validateCommentParams,
    validateMoveTask,
    validateTaskCreate,
    validateTaskId,
    validateTaskUpdate,
    validateTimeLog
} = require('../validators/task.validator');

const router = express.Router();

router.use(protect);

router.get('/', controller.list);
router.post('/', validate({ body: validateTaskCreate }), controller.create);
router.get('/:id', validate({ params: validateTaskId }), controller.getById);
router.patch('/:id', validate({ params: validateTaskId, body: validateTaskUpdate }), controller.update);
router.post('/:id/move', validate({ params: validateTaskId, body: validateMoveTask }), controller.move);
router.post('/:id/clone', validate({ params: validateTaskId }), controller.clone);
router.post('/:id/comments', validate({ params: validateTaskId, body: validateComment }), controller.comment);
router.patch('/:id/comments/:commentId', validate({ params: validateCommentParams, body: validateComment }), controller.editComment);
router.delete('/:id/comments/:commentId', validate({ params: validateCommentParams }), controller.removeComment);
router.post('/:id/time-logs', validate({ params: validateTaskId, body: validateTimeLog }), controller.timeLog);

module.exports = router;
