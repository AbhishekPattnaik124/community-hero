const { DynamicTool } = require("@langchain/core/tools");
const AgentAction = require("../../models/AgentAction.model");

const draftAuthorityEmailTool = new DynamicTool({
  name: "draft_authority_email",
  description: "Drafts a formal email to a municipal authority regarding an issue, requiring human approval before sending. Input should be a JSON string with { issueId, authorityEmail, subject, body }.",
  func: async (input) => {
    try {
      const payload = JSON.parse(input);
      const action = await AgentAction.create({
        agentName: "AuthorityLiaison",
        actionType: "draft_email",
        payload,
        reason: `Drafted follow-up email to ${payload.authorityEmail} for issue ${payload.issueId}`
      });
      return `Successfully drafted email. Action ID ${action._id} is pending human approval.`;
    } catch (e) {
      return "Failed to parse input or create action. Ensure input is valid JSON.";
    }
  },
});

module.exports = { draftAuthorityEmailTool };
