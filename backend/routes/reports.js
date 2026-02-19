const express = require('express');
const router = express.Router();
const {
  generateStudentReport,
  getOverviewStats,
  getGradeStats,
  getAttendanceStats
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:id', protect, generateStudentReport);
router.get('/overview', protect, authorize('admin'), getOverviewStats);
router.get('/grades', protect, authorize('admin', 'teacher'), getGradeStats);
router.get('/attendance', protect, authorize('admin', 'teacher'), getAttendanceStats);

module.exports = router;
