const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getTeachers,
  getParents,
  togglePayment
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.get('/students', protect, authorize('admin', 'teacher'), getStudents);
router.get('/teachers', protect, authorize('admin'), getTeachers);
router.get('/parents', protect, authorize('admin'), getParents);
router.put('/:id/payment', togglePayment);

module.exports = router;
