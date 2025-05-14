const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/:user_id', userController.getUser);
router.put('/:user_id', userController.updateUser);
router.delete('/:user_id', userController.deleteUser);

module.exports = router;