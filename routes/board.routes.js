const express = require('express');
const router = express.Router();
const { getByProject, create, updateWIP } = require('../controllers/board.controller');

router.get('/:projectId', getByProject);
router.post('/', create);
router.put('/wip', updateWIP); 

module.exports = router;