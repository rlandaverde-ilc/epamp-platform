const express = require('express');
const router = express.Router();
const {
  getGrades,
  getStudentGrades,
  getStudentAverage,
  createGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getGrades)
  .post(authorize('admin', 'teacher'), createGrade);

router.get('/student/:id', protect, authorize('admin', 'teacher', 'parent'), getStudentGrades);
router.get('/average/:studentId', protect, getStudentAverage);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateGrade)
  .delete(authorize('admin', 'teacher'), deleteGrade);

module.exports = router;
