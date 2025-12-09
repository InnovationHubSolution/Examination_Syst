const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @route   GET /api/certificates
// @desc    Get all certificates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { student, certificateType, academicYear, status } = req.query;
    const query = {};

    // Students can only see their own certificates
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else {
      if (student) query.student = student;
    }

    if (certificateType) query.certificateType = certificateType;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const certificates = await Certificate.find(query)
      .populate('student', 'firstName lastName studentId email')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/:id
// @desc    Get single certificate
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName studentId email school');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check access rights
    if (req.user.role === 'student' && certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      });
    }

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
    });
  }
});

// @route   POST /api/certificates
// @desc    Generate new certificate
// @access  Private/Admin
router.post('/', protect, authorize('administrator'), async (req, res) => {
  try {
    const certificateData = req.body;

    // If transcript, fetch student results
    if (certificateData.certificateType === 'transcript') {
      const results = await Result.find({
        student: certificateData.student,
        academicYear: certificateData.academicYear,
        isPublished: true
      });

      if (results.length > 0) {
        certificateData.results = results.map(r => ({
          subject: r.subject,
          grade: r.letterGrade,
          score: r.scores.percentage
        }));

        // Calculate overall GPA
        const totalPercentage = results.reduce((sum, r) => sum + r.scores.percentage, 0);
        certificateData.gpa = (totalPercentage / results.length / 25).toFixed(2); // Convert to 4.0 scale
      }
    }

    const certificate = await Certificate.create(certificateData);

    // Generate PDF
    await generateCertificatePDF(certificate);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/verify/:code
// @desc    Verify certificate by code
// @access  Public
router.get('/verify/:code', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      verificationCode: req.params.code.toUpperCase()
    }).populate('student', 'firstName lastName studentId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code'
      });
    }

    if (certificate.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `This certificate is ${certificate.status}`
      });
    }

    // Update verification count
    certificate.verificationCount += 1;
    certificate.lastVerified = Date.now();
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate verified successfully',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        title: certificate.title,
        studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
        studentId: certificate.student.studentId,
        issueDate: certificate.issueDate,
        academicYear: certificate.academicYear,
        status: certificate.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message
    });
  }
});

// @route   GET /api/certificates/:id/download
// @desc    Download certificate PDF
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName studentId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check access rights
    if (req.user.role === 'student' && certificate.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    if (!certificate.pdfPath || !fs.existsSync(certificate.pdfPath)) {
      await generateCertificatePDF(certificate);
    }

    res.download(certificate.pdfPath, `certificate_${certificate.certificateNumber}.pdf`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
});

// @route   PUT /api/certificates/:id/revoke
// @desc    Revoke certificate
// @access  Private/Admin
router.put('/:id/revoke', protect, authorize('administrator'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = 'revoked';
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking certificate',
      error: error.message
    });
  }
});

// Helper function to generate certificate PDF
async function generateCertificatePDF(certificate) {
  return new Promise(async (resolve, reject) => {
    try {
      const student = await certificate.populate('student', 'firstName lastName studentId');
      
      const certDir = path.join(__dirname, '../../uploads/certificates');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      const filename = `certificate_${certificate.certificateNumber}.pdf`;
      const filepath = path.join(certDir, filename);

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Add border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

      // Header
      doc.fontSize(40).font('Helvetica-Bold')
        .text('CERTIFICATE', 0, 100, { align: 'center' });

      doc.fontSize(16).font('Helvetica')
        .text(`of ${certificate.certificateType.charAt(0).toUpperCase() + certificate.certificateType.slice(1)}`, 0, 160, { align: 'center' });

      // Body
      doc.fontSize(12).font('Helvetica')
        .text('This is to certify that', 0, 220, { align: 'center' });

      doc.fontSize(28).font('Helvetica-Bold')
        .text(`${student.student.firstName} ${student.student.lastName}`, 0, 260, { align: 'center' });

      doc.fontSize(12).font('Helvetica')
        .text(`Student ID: ${student.student.studentId}`, 0, 300, { align: 'center' });

      doc.fontSize(14).font('Helvetica')
        .text(certificate.description || certificate.title, 100, 340, {
          align: 'center',
          width: doc.page.width - 200
        });

      // Results for transcripts
      if (certificate.results && certificate.results.length > 0) {
        let yPos = 400;
        doc.fontSize(12).font('Helvetica-Bold')
          .text('Academic Results:', 150, yPos);
        
        yPos += 20;
        certificate.results.forEach(result => {
          doc.fontSize(10).font('Helvetica')
            .text(`${result.subject}: ${result.grade} (${result.score}%)`, 150, yPos);
          yPos += 15;
        });

        if (certificate.gpa) {
          yPos += 5;
          doc.fontSize(11).font('Helvetica-Bold')
            .text(`Overall GPA: ${certificate.gpa}`, 150, yPos);
        }
      }

      // Footer
      doc.fontSize(10).font('Helvetica')
        .text(`Academic Year: ${certificate.academicYear}`, 0, doc.page.height - 150, { align: 'center' })
        .text(`Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}`, 0, doc.page.height - 130, { align: 'center' })
        .text(`Certificate No: ${certificate.certificateNumber}`, 0, doc.page.height - 110, { align: 'center' })
        .text(`Verification Code: ${certificate.verificationCode}`, 0, doc.page.height - 90, { align: 'center' });

      doc.end();

      stream.on('finish', async () => {
        certificate.pdfPath = filepath;
        await certificate.save();
        resolve(filepath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;
