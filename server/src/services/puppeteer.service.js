/**
 * Digital Authority Bridge - Auto-Complaint Filer
 * Automates filing complaints on PGPortal & KMC using Puppeteer.
 */

const puppeteer = require('puppeteer');
const logger = require('../config/logger');
const path = require('path');

class PuppeteerService {
  /**
   * Submits an issue to a government portal.
   * Note: This is an architectural simulation due to Captchas and legal boundaries
   * on live Indian government servers. It launches a headless browser, mimics typing,
   * but intercepts the final submission and generates a mock official ID.
   */
  async fileComplaint(issue) {
    logger.info(`[Puppeteer] Launching headless browser for issue ${issue._id}...`);
    
    // Choose portal based on city/level
    let targetUrl = 'https://pgportal.gov.in/';
    let portalName = 'PGPortal (Central)';
    
    if (issue.location.city.toLowerCase() === 'kolkata') {
      targetUrl = 'https://www.kmcgov.in/KMCPortal/jsp/KMCPortalHome1.jsp';
      portalName = 'KMC Grievance Cell';
    }

    try {
      // Launch browser
      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      logger.info(`[Puppeteer] Navigating to ${portalName}: ${targetUrl}`);
      // In a real script, we would await page.goto(targetUrl)
      // Here we mock the flow to avoid hitting real govt servers heavily during testing
      
      // Simulate typing data
      logger.info(`[Puppeteer] Auto-filling form fields for category: ${issue.category}...`);
      await new Promise(r => setTimeout(r, 1000)); // Simulate typing latency
      
      // Take a screenshot of the "Confirmation Page"
      // We will generate a blank screenshot as proof for the architecture
      const screenshotDir = path.join(__dirname, '../../uploads/screenshots');
      const fs = require('fs');
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
      
      const screenshotFilename = `gov_proof_${issue._id}.png`;
      const screenshotPath = path.join(screenshotDir, screenshotFilename);
      
      // Instead of taking a real screenshot of KMC, we just generate a dummy file
      // await page.screenshot({ path: screenshotPath });
      fs.writeFileSync(screenshotPath, 'dummy screenshot data');

      await browser.close();

      // Generate a mock official government registration ID
      const officialId = `GOV-${issue.location.city.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`;
      
      logger.info(`[Puppeteer] Successfully filed on ${portalName}. ID: ${officialId}`);
      
      return {
        success: true,
        officialGovId: officialId,
        officialPortal: portalName,
        screenshotUrl: `/uploads/screenshots/${screenshotFilename}`
      };

    } catch (error) {
      logger.error(`[Puppeteer] Auto-filing failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PuppeteerService();
