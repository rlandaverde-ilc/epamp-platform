const User = require('../models/User');
const Level = require('../models/Level');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .populate('level')
      .populate('parent', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('level')
      .populate('parent', 'firstName lastName email')
      .populate('children', 'firstName lastName email level');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, address, dateOfBirth, level, parent, subjects, children } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      address,
      dateOfBirth,
      level,
      parent,
      subjects,
      children
    });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role, phone, address, dateOfBirth, level, parent, subjects, children, isActive, paymentStatus, levelCompleted } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, role, phone, address, dateOfBirth, level, parent, subjects, children, isActive, paymentStatus, levelCompleted },
      { new: true, runValidators: true }
    ).populate('level');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private/Admin/Teacher
exports.getStudents = async (req, res) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    
    let query = { role: 'student' };
    if (level) {
      query.level = level;
    }

    const students = await User.find(query)
      .populate('level')
      .populate('parent', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ lastName: 1, firstName: 1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: students.length,
      total,
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all teachers
// @route   GET /api/users/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName email subjects')
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get parents
// @route   GET /api/users/parents
// @access  Private/Admin
exports.getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .populate('children', 'firstName lastName email level')
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      count: parents.length,
      parents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle payment status
// @route   PUT /api/users/:id/payment
// @access  Private/Admin
exports.togglePayment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.paymentStatus = user.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
