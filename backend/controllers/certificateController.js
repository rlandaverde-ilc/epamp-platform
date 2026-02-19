const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Level = require('../models/Level');
const Grade = require('../models/Grade');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private
exports.getCertificates = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'parent') {
      const children = await User.find({ parent: req.user.id });
      query.student = { $in: children.map(c => c._id) };
    } else if (status) {
      query.status = status;
    }

    const certificates = await Certificate.find(query)
      .populate('student', 'firstName lastName email')
      .populate('level', 'name category')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's certificates
// @route   GET /api/certificates/student/:id
// @access  Private
exports.getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.params.id })
      .populate('level', 'name category')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Request certificate
// @route   POST /api/certificates
// @access  Private/Student
exports.requestCertificate = async (req, res) => {
  try {
    const { level } = req.body;

    // Check if student has completed the level (has grades >= 70 average)
    const grades = await Grade.find({ student: req.user.id });
    if (grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No grades found. Complete courses to request a certificate.'
      });
    }

    const total = grades.reduce((sum, g) => sum + g.grade, 0);
    const average = total / grades.length;

    if (average < 70) {
      return res.status(400).json({
        success: false,
        message: `Your average (${average.toFixed(1)}) is below 70. You need at least 70% to get a certificate.`
      });
    }

    // Check if certificate already requested for this level
    const existing = await Certificate.findOne({
      student: req.user.id,
      level
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already requested for this level'
      });
    }

    const certificate = await Certificate.create({
      student: req.user.id,
      level,
      status: 'pending'
    });

    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate('student', 'firstName lastName email')
      .populate('level', 'name category');

    res.status(201).json({
      success: true,
      certificate: populatedCertificate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve certificate
// @route   PUT /api/certificates/:id/approve
// @access  Private/Admin
exports.approveCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('level', 'name category');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = 'approved';
    certificate.approvedBy = req.user.id;
    certificate.approvedAt = Date.now();
    await certificate.save();

    // Update student's levelCompleted status
    if (certificate.student && certificate.student._id) {
      await User.findByIdAndUpdate(certificate.student._id, {
        levelCompleted: true
      });
    }

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get certificate for download
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('level', 'name category');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permission
    if (req.user.role === 'student' && certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    if (certificate.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Certificate not yet approved'
      });
    }

    res.json({
      success: true,
      certificate,
      canDownload: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
