/**
 * Digital Authority Bridge - RTI Auto-Generator
 * Uses PDFKit to construct a legal RTI application under Section 6(1) of the RTI Act, 2005.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

class RtiService {
  /**
   * Generates a PDF application for RTI
   */
  async generateRTI(issue) {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`[RTI] Generating RTI Application for Issue ${issue._id}`);
        
        const rtiDir = path.join(__dirname, '../../uploads/rtis');
        if (!fs.existsSync(rtiDir)) fs.mkdirSync(rtiDir, { recursive: true });

        const filename = `RTI_${issue._id}_${Date.now()}.pdf`;
        const filePath = path.join(rtiDir, filename);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(16).font('Helvetica-Bold').text('APPLICATION UNDER RTI ACT 2005', { align: 'center' });
        doc.moveDown(2);

        // To section
        doc.fontSize(12).font('Helvetica').text('To,');
        doc.text('The Public Information Officer (PIO),');
        doc.text(`Department of ${issue.category.toUpperCase()},`);
        doc.text(`${issue.location.city.toUpperCase()} Municipal Corporation.`);
        doc.moveDown(2);

        // Subject
        doc.font('Helvetica-Bold').text(`Subject: Request for information under Section 6(1) of RTI Act 2005 regarding unresolved issue (ID: ${issue._id})`);
        doc.moveDown();

        // Body
        doc.font('Helvetica').text('Sir/Madam,');
        doc.moveDown();
        doc.text(`I, a citizen of India, filed a civic complaint regarding "${issue.title}" located at ${issue.location.address} on ${new Date(issue.createdAt).toLocaleDateString()}.`);
        doc.moveDown();
        doc.text(`As of today, the issue has remained unresolved for over 30 days. Under the RTI Act 2005, please provide the following information:`);
        doc.moveDown();
        
        // Questions
        doc.text('1. Provide the current status of the action taken on this complaint.');
        doc.text('2. Provide the names and designations of the officers responsible for resolving this issue.');
        doc.text('3. Provide the certified copy of the file notings regarding this complaint.');
        doc.text('4. Provide the estimated timeframe within which this issue will be fully resolved.');
        doc.moveDown(2);

        // Footer
        doc.text('I have attached the required application fee of Rs. 10 via Postal Order / Online Payment.');
        doc.moveDown(2);
        doc.text('Yours faithfully,');
        doc.text('Community Hero Automated Legal Bridge');
        doc.text('(On behalf of the reporting citizen)');

        doc.end();

        stream.on('finish', () => {
          logger.info(`[RTI] PDF successfully saved to ${filePath}`);
          resolve({
            success: true,
            filePath,
            url: `/uploads/rtis/${filename}`
          });
        });

      } catch (err) {
        logger.error(`[RTI] Error generating PDF: ${err.message}`);
        reject(err);
      }
    });
  }
}

module.exports = new RtiService();
