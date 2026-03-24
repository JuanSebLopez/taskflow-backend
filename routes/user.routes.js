const express = require('express');
const controller = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('ADMIN'), controller.listUsers);
router.patch('/:id/deactivate', restrictTo('ADMIN'), controller.deactivate);

module.exports = router;
