const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Level = require('../models/Level');

const generateCertificate = async (student, level, certificateNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4 landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F8F8F8');

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .stroke('#173686');

      // Inner border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .stroke('#61ABE0');

      // Header background
      doc.rect(50, 50, doc.page.width - 100, 120).fill('#173686');

      // Logo placeholder
      doc.rect(80, 70, 60, 60).fill('#FFFFFF').stroke('#CCCCCC');
      doc.fillColor('#173686').fontSize(8).text('LOGO', 95, 95, { align: 'center' });

      // Title
      doc.fillColor('#FFFFFF').fontSize(36).text('CERTIFICATE', 0, 80, { align: 'center' });
      doc.fontSize(18).text('OF COMPLETION', 0, 115, { align: 'center' });

      // Decorative line
      doc.moveTo(200, 180).lineTo(614, 180).lineWidth(2).stroke('#FAD907');

      // Body text
      doc.fillColor('#333333').fontSize(14);
      doc.text('This is to certify that', 0, 220, { align: 'center' });

      // Student name
      doc.fontSize(32).fillColor('#173686');
      doc.text(`${student.firstName} ${student.lastName}`, 0, 260, { align: 'center' });

      // Certificate text
      doc.fillColor('#333333').fontSize(14);
      doc.text('has successfully completed the', 0, 320, { align: 'center' });

      // Level name
      doc.fontSize(24).fillColor('#173686');
      doc.text(level.name, 0, 360, { align: 'center' });

      // Category
      doc.fontSize(12).fillColor('#666666');
      const categoryText = {
        'kids': 'Kids Program (Ages 4-12)',
        'teens': 'Teens Program (Ages 13-17)',
        'conversation': 'Conversation Course',
        'kids4-6': 'Kids Program (Ages 4-6)'
      };
      doc.text(`(${categoryText[level.category] || level.category})`, 0, 395, { align: 'center' });

      // Date
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fontSize(12).fillColor('#666666');
      doc.text(`Issued: ${date}`, 0, 450, { align: 'center' });

      // Certificate number
      doc.fontSize(10).fillColor('#999999');
      doc.text(`Certificate No: ${certificateNumber}`, 0, 480, { align: 'center' });

      // Signature area
      const sigY = 520;
      
      // Line
      doc.moveTo(150, sigY).lineTo(350, sigY).lineWidth(1).stroke('#333333');
      doc.fontSize(10).fillColor('#666666');
      doc.text('Program Director', 150, sigY + 10, { width: 200, align: 'center' });

      // Seal placeholder
      doc.rect(400, sigY - 30, 100, 80).fill('#FFFFFF').stroke('#173686');
      doc.fillColor('#173686').fontSize(10).text('OFFICIAL', 420, sigY + 5, { width: 60, align: 'center' });
      doc.fontSize(8).text('SEAL', 430, sigY + 35, { width: 40, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };
