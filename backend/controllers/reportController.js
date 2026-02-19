const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const Level = require('../models/Level');

// @desc    Generate student PDF report
// @route   GET /api/reports/student/:id
// @access  Private
exports.generateStudentReport = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check permission
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    // Get student info
    const student = await User.findById(studentId)
      .populate('level')
      .populate('parent', 'firstName lastName email phone');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get grades
    const grades = await Grade.find({ student: studentId })
      .populate('course', 'name')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate average
    let average = 0;
    let status = 'No grades';
    if (grades.length > 0) {
      const total = grades.reduce((sum, g) => sum + g.grade, 0);
      average = Math.round(total / grades.length);
      status = average >= 70 ? 'Approved' : 'At Risk';
    }

    // Get attendance
    const attendance = await Attendance.find({ student: studentId })
      .populate('course', 'name')
      .sort({ date: -1 })
      .limit(30);

    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length
    };

    // Create PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${student.firstName}_${student.lastName}.pdf`);

    doc.pipe(res);

    // Header with logo placeholder
    doc.rect(0, 0, doc.page.width, 100).fill('#173686');
    doc.fillColor('#FFFFFF').fontSize(24).text('ACADEMIC PROGRESS REPORT', 50, 35, { align: 'center' });
    doc.fontSize(10).text('English Program', 50, 55, { align: 'center' });
    
    // Logo placeholder (right side)
    doc.rect(doc.page.width - 120, 20, 70, 60).fill('#FFFFFF').stroke('#CCCCCC');
    doc.fillColor('#173686').fontSize(8).text('LOGO', doc.page.width - 110, 45, { align: 'center' });

    // Student Information
    doc.moveDown(2);
    doc.fillColor('#173686').fontSize(14).text('Student Information', { underline: true });
    doc.moveDown(0.5);
    
    doc.fillColor('#333333').fontSize(11);
    doc.text(`Name: ${student.firstName} ${student.lastName}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Level: ${student.level ? student.level.name : 'Not assigned'}`);
    doc.text(`Academic Year: 2025-2026`);

    // Academic Performance
    doc.moveDown();
    doc.fillColor('#173686').fontSize(14).text('Academic Performance', { underline: true });
    doc.moveDown(0.5);

    // Status badge
    const statusColor = average >= 90 ? '#61ABE0' : average >= 70 ? '#FAD907' : '#EF2200';
    doc.fillColor(statusColor).fontSize(12).text(`Status: ${status}`, { continued: true });
    doc.fillColor('#333333').fontSize(11).text(` | Average: ${average}%`);

    // Grades table
    doc.moveDown();
    doc.fontSize(11);
    
    if (grades.length > 0) {
      // Table header
      const tableTop = doc.y;
      doc.fillColor('#173686').fontSize(10);
      doc.text('Course', 50, tableTop);
      doc.text('Grade', 250, tableTop);
      doc.text('Semester', 320, tableTop);
      doc.text('Teacher', 400, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#173686');
      
      // Table rows
      doc.fillColor('#333333').fontSize(10);
      let y = tableTop + 20;
      
      grades.forEach((g, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(g.course ? g.course.name : 'N/A', 50, y);
        doc.text(g.grade.toString(), 250, y);
        doc.text(g.semester, 320, y);
        doc.text(g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : 'N/A', 400, y);
        y += 18;
      });
    } else {
      doc.text('No grades recorded yet.');
    }

    // Attendance Summary
    doc.moveDown(2);
    const attendanceY = doc.y;
    doc.fillColor('#173686').fontSize(14).text('Attendance Summary', { underline: true });
    doc.moveDown(0.5);
    
    doc.fillColor('#333333').fontSize(11);
    doc.text(`Total Classes: ${attendanceStats.total}`);
    doc.text(`Present: ${attendanceStats.present}`);
    doc.text(`Absent: ${attendanceStats.absent}`);
    doc.text(`Late: ${attendanceStats.late}`);
    
    const attendancePercentage = attendanceStats.total > 0 
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
      : 0;
    doc.text(`Attendance Rate: ${attendancePercentage}%`);

    // Teacher Comments
    doc.moveDown(2);
    const commentsY = doc.y;
    doc.fillColor('#173686').fontSize(14).text('Teacher Comments', { underline: true });
    doc.moveDown(0.5);
    
    doc.fillColor('#333333').fontSize(11);
    const comments = grades.filter(g => g.comments).map(g => `- ${g.comments}`).join('\n');
    if (comments) {
      doc.text(comments);
    } else {
      doc.text('No comments from teachers.');
    }

    // Footer
    doc.moveDown(3);
    const footerY = doc.page.height - 80;
    doc.fillColor('#666666').fontSize(9);
    doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 50, footerY);
    doc.text(`Report ID: RPT-${Date.now()}`, 400, footerY);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

// @desc    Get statistics
// @route   GET /api/stats/overview
// @access  Private/Admin
exports.getOverviewStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const paidStudents = await User.countDocuments({ role: 'student', paymentStatus: 'paid' });
    const unpaidStudents = await User.countDocuments({ role: 'student', paymentStatus: 'unpaid' });

    const levels = await Level.find();
    const totalLevels = levels.length;

    // Recent registrations
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt level');

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalAdmins,
        totalLevels,
        paidStudents,
        unpaidStudents,
        recentStudents
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get grade statistics
// @route   GET /api/stats/grades
// @access  Private/Admin/Teacher
exports.getGradeStats = async (req, res) => {
  try {
    const grades = await Grade.find().populate('student', 'firstName lastName');
    
    if (grades.length === 0) {
      return res.json({
        success: true,
        stats: {
          average: 0,
          highest: 0,
          lowest: 0,
          distribution: []
        }
      });
    }

    const values = grades.map(g => g.grade);
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    // Distribution
    const distribution = [
      { range: '90-100', count: grades.filter(g => g.grade >= 90).length },
      { range: '80-89', count: grades.filter(g => g.grade >= 80 && g.grade < 90).length },
      { range: '70-79', count: grades.filter(g => g.grade >= 70 && g.grade < 80).length },
      { range: '60-69', count: grades.filter(g => g.grade >= 60 && g.grade < 70).length },
      { range: '0-59', count: grades.filter(g => g.grade < 60).length }
    ];

    res.json({
      success: true,
      stats: {
        average,
        highest,
        lowest,
        distribution,
        totalGrades: grades.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/stats/attendance
// @access  Private/Admin/Teacher
exports.getAttendanceStats = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    
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
