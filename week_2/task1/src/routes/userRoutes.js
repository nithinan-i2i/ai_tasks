const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const userSchema = require('../../validators/user');
const auth = require('../middleware/auth');

router.post('/', validate(userSchema.create), userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', auth, validate(userSchema.update), userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router; 