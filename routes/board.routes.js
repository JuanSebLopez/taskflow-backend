const express = require('express');
const controller = require('../controllers/board.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', controller.getByProject);
router.post('/project/:projectId', controller.create);
router.post('/:boardId/columns', controller.createColumn);
router.patch('/:boardId/columns/reorder', controller.reorder);
router.patch('/:boardId/columns/:columnId', controller.editColumn);
router.delete('/:boardId/columns/:columnId', controller.removeColumn);

module.exports = router;
