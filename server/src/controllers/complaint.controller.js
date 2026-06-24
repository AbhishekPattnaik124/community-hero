const Issue = require('../models/Issue.model');
const automationService = require('../services/automationService');
const verificationService = require('../services/verificationService');
const slaService = require('../services/slaService');

exports.fileComplaint = async (req, res) => {
  try {
    const { title, description, category, location, address, wardId } = req.body;
    
    // Create local issue
    const newIssue = new Issue({
      title,
      description,
      category,
      location,
      address,
      wardId, // Assume we add this or store in a separate relationship
      reporter: req.user._id,
      createdAt: new Date(),
      slaDeadline: slaService.calculateSlaDeadline(category, new Date())
    });

    // Auto-file with external portal via automation service
    const automationResult = await automationService.submitComplaint({
      title, description, category, location, address
    });

    if (automationResult.success) {
      newIssue.officialGovId = automationResult.officialGovId;
      newIssue.officialPortal = automationResult.portalUsed;
      newIssue.timeline.push({
        status: 'open',
        note: `Auto-filed with external authority. Ref: ${automationResult.officialGovId}`
      });
    } else {
      newIssue.timeline.push({
        status: 'open',
        note: `Failed to auto-file externally: ${automationResult.error}`
      });
    }

    await newIssue.save();
    res.status(201).json({ success: true, data: newIssue });

  } catch (error) {
    console.error('Error filing complaint:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.verifyResolution = async (req, res) => {
  try {
    const { issueId, afterImageUrl } = req.body;
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    if (!issue.images || issue.images.length === 0) {
      return res.status(400).json({ success: false, error: 'Original issue has no image to compare.' });
    }

    const beforeImageUrl = issue.images[0];
    
    // Call verification service using SSIM
    const verificationResult = await verificationService.verifyResolutionPhotos(beforeImageUrl, afterImageUrl);

    if (verificationResult.verified) {
      issue.resolutionProofImages.push(afterImageUrl);
      issue.status = 'resolved';
      issue.resolvedAt = new Date();
      issue.timeline.push({
        status: 'resolved',
        note: `Resolution verified by AI with score: ${verificationResult.score.toFixed(2)}`
      });
      await issue.save();
    }

    res.status(200).json({ success: true, verification: verificationResult, issue });

  } catch (error) {
    console.error('Error verifying resolution:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
