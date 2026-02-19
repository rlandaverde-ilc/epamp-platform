const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getStudentAttendance,
  recordAttendance,
  bulkRecordAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(authorize('admin', 'teacher'), recordAttendance);

router.post('/bulk', authorize('admin', 'teacher'), bulkRecordAttendance);

router.get('/student/:id', protect, authorize('admin', 'teacher', 'parent'), getStudentAttendance);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateAttendance)
  .delete(authorize('admin', 'teacher'), deleteAttendance);

module.exports = router;
