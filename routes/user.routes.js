const express = require('express');
const router = express.Router();
const { getAll, create } = require('../controllers/user.controller');

router.get('/', getAll);
router.post('/', create);

module.exports = router;