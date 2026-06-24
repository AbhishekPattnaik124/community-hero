const Councillor = require('../models/Councillor.model');

exports.getAllCouncillors = async (req, res) => {
  try {
    const councillors = await Councillor.find().sort({ transparencyScore: -1 });
    res.status(200).json({ success: true, data: councillors });
  } catch (error) {
    console.error('Error fetching councillors:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.escalateToCouncillor = async (req, res) => {
  try {
    const { wardId, issueId } = req.body;
    
    const councillor = await Councillor.findOne({ wardId });
    if (!councillor) {
      return res.status(404).json({ success: false, error: 'Councillor not found for this ward' });
    }

    // Mock escalation logic (e.g., sending WhatsApp/Email via mock service)
    console.log(`[MOCK ESCALATION] Sending WhatsApp to ${councillor.whatsapp} for issue ${issueId}`);
    console.log(`[MOCK ESCALATION] Sending Email to ${councillor.email} for issue ${issueId}`);

    // Update councillor metrics
    councillor.issuesEscalated += 1;
    await councillor.save();

    res.status(200).json({ 
      success: true, 
      message: `Issue escalated to ${councillor.name}.`,
      contactMethod: 'WhatsApp & Email (Mock)' 
    });

  } catch (error) {
    console.error('Error escalating to councillor:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
