const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { student, course, startDate, endDate } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'parent') {
      const children = await User.find({ parent: req.user.id });
      query.student = { $in: children.map(c => c._id) };
    } else if (student) {
      query.student = student;
    }
    
    if (course) query.course = course;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's attendance
// @route   GET /api/attendance/student/:id
// @access  Private/Teacher/Parent
exports.getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.id })
      .populate('course', 'name')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };
    
    stats.percentage = stats.total > 0 
      ? Math.round((stats.present / stats.total) * 100) 
      : 0;

    res.json({
      success: true,
      attendance,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Record attendance
// @route   POST /api/attendance
// @access  Private/Teacher
exports.recordAttendance = async (req, res) => {
  try {
    const { student, course, date, status, notes } = req.body;

    // Check if attendance already recorded for this student/course/date
    const existing = await Attendance.findOne({
      student,
      course,
      date: new Date(date).toISOString().split('T')[0]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this date'
      });
    }

    const attendance = await Attendance.create({
      student,
      course,
      date,
      status,
      notes,
      recordedBy: req.user.id
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name')
      .populate('recordedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      attendance: populatedAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk record attendance
// @route   POST /api/attendance/bulk
// @access  Private/Teacher
exports.bulkRecordAttendance = async (req, res) => {
  try {
    const { course, date, records } = req.body; // records: [{ student, status, notes }]

    const attendanceRecords = records.map(record => ({
      student: record.student,
      course,
      date,
      status: record.status || 'present',
      notes: record.notes,
      recordedBy: req.user.id
    }));

    await Attendance.insertMany(attendanceRecords);

    res.status(201).json({
      success: true,
      message: `${attendanceRecords.length} attendance records created`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
exports.updateAttendance = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName')
     .populate('course', 'name')
     .populate('recordedBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
