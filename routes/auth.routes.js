const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateLogin, validateProfileUpdate, validateRegister } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate({ body: validateRegister }), controller.register);
router.post('/login', validate({ body: validateLogin }), controller.login);
router.post('/logout', protect, controller.logout);
router.get('/me', protect, controller.me);
router.patch('/me', protect, validate({ body: validateProfileUpdate }), controller.updateMe);

module.exports = router;
