const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', protect, controller.logout);
router.get('/me', protect, controller.me);
router.patch('/me', protect, controller.updateMe);

module.exports = router;
