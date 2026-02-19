const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getStudentCertificates,
  requestCertificate,
  approveCertificate,
  downloadCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCertificates)
  .post(authorize('student'), requestCertificate);

router.get('/student/:id', protect, getStudentCertificates);

router.put('/:id/approve', authorize('admin'), approveCertificate);
router.get('/:id/download', protect, downloadCertificate);

module.exports = router;
