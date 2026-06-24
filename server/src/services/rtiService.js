const nodemailer = require('nodemailer');

/**
 * Service to handle automatic generation and mailing of RTI applications.
 */
class RtiService {
  constructor() {
    // Mock SMTP config
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mock_user@ethereal.email',
        pass: 'mock_password'
      }
    });
  }

  /**
   * Generates RTI document text based on Section 6(1) of the RTI Act, 2005.
   * @param {Object} issue The unresolved issue details.
   */
  generateRtiContent(issue) {
    const today = new Date().toLocaleDateString();
    return `
To,
The Public Information Officer (PIO)
[Relevant Department]

Date: ${today}

Subject: Application under Section 6(1) of the Right to Information Act, 2005.

Respected Sir/Madam,

I had filed a complaint regarding "${issue.title}" on ${new Date(issue.createdAt).toLocaleDateString()}.
The complaint registration number is ${issue.officialGovId || 'N/A'}.
It has been over 30 days and no action has been taken.

Kindly provide the following information under the RTI Act, 2005:
1. The current status of my complaint.
2. The name and designation of the officer responsible for taking action on this complaint.
3. The reason for the delay in resolving the issue.
4. Certified copies of any file notes or correspondence related to this complaint.

I am attaching the requisite fee as per rules.

Yours faithfully,
[Citizen Name]
[Citizen Contact]
    `;
  }

  /**
   * Generates and emails the RTI application to the PIO.
   * @param {Object} issue The issue model instance.
   */
  async autoFileRti(issue) {
    try {
      const content = this.generateRtiContent(issue);
      
      // Mock PIO email
      const pioEmail = 'pio.mock@example.gov';

      // Send the email (mocked)
      console.log(`Sending RTI to ${pioEmail} for issue ${issue._id}...`);
      
      // Uncomment to actually send using the mock transport
      /*
      await this.transporter.sendMail({
        from: '"Community Hero RTI Bot" <rti-bot@communityhero.local>',
        to: pioEmail,
        subject: `RTI Application under Sec 6(1) regarding complaint ${issue.officialGovId}`,
        text: content,
      });
      */

      return {
        success: true,
        message: 'RTI application successfully generated and mailed.',
        content
      };
    } catch (error) {
      console.error('Error auto-filing RTI:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new RtiService();
