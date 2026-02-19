const Grade = require('../models/Grade');
const User = require('../models/User');

// @desc    Get grades
// @route   GET /api/grades
// @access  Private
exports.getGrades = async (req, res) => {
  try {
    const { student, course, semester } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'parent') {
      // Parent can see their children's grades
      const children = await User.find({ parent: req.user.id });
      query.student = { $in: children.map(c => c._id) };
    } else if (student) {
      query.student = student;
    }
    
    if (course) query.course = course;
    if (semester) query.semester = semester;

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name level')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's grades
// @route   GET /api/grades/student/:id
// @access  Private/Teacher/Parent
exports.getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.id })
      .populate('course', 'name level')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's average
// @route   GET /api/grades/average/:studentId
// @access  Private
exports.getStudentAverage = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId });
    
    if (grades.length === 0) {
      return res.json({
        success: true,
        average: 0,
        status: 'No grades',
        totalGrades: 0
      });
    }

    const total = grades.reduce((sum, g) => sum + g.grade, 0);
    const average = Math.round(total / grades.length);
    
    let status = 'At Risk';
    if (average >= 90) status = 'Approved (Excellent)';
    else if (average >= 70) status = 'Approved';

    res.json({
      success: true,
      average,
      status,
      totalGrades: grades.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create grade
// @route   POST /api/grades
// @access  Private/Teacher
exports.createGrade = async (req, res) => {
  try {
    const { student, course, grade, semester, comments } = req.body;

    const newGrade = await Grade.create({
      student,
      course,
      teacher: req.user.id,
      grade,
      semester,
      comments
    });

    const populatedGrade = await Grade.findById(newGrade._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'name')
      .populate('teacher', 'firstName lastName');

    res.status(201).json({
      success: true,
      grade: populatedGrade
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Teacher
exports.updateGrade = async (req, res) => {
  try {
    const { grade, semester, comments } = req.body;

    const existingGrade = await Grade.findById(req.params.id);

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { grade, semester, comments },
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName')
     .populate('course', 'name')
     .populate('teacher', 'firstName lastName');

    res.json({
      success: true,
      grade: updatedGrade
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Teacher
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    await grade.deleteOne();

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
