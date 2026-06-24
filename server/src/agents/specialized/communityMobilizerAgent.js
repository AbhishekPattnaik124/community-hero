const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getIssueAnalyticsTool } = require("../tools/issue.tools");
const { DynamicTool } = require("@langchain/core/tools");
const AgentAction = require("../../models/AgentAction.model");
require("dotenv").config();

const draftSocialMediaPostTool = new DynamicTool({
  name: "draft_social_media_post",
  description: "Drafts a WhatsApp/Twitter post to mobilize the community for a low-engagement issue. Input should be a JSON string with { issueId, platform, message }.",
  func: async (input) => {
    try {
      const payload = JSON.parse(input);
      const action = await AgentAction.create({
        agentName: "CommunityMobilizer",
        actionType: "post_social_media",
        payload,
        reason: `Generated viral template to boost engagement for issue ${payload.issueId}`
      });
      return `Successfully drafted social post. Action ID ${action._id} is pending human approval.`;
    } catch (e) {
      return "Failed to parse input.";
    }
  }
});

async function runCommunityMobilizer() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      temperature: 0.7,
    });

    const tools = [getIssueAnalyticsTool, draftSocialMediaPostTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Community Mobilizer Agent. Find issues with 'low_engagement' using analytics. For each, generate a catchy, viral social media post (WhatsApp format with emojis) to mobilize citizens, and draft it for approval."],
      ["human", "Find low engagement issues and draft mobilization posts."],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    console.log(`[CommunityMobilizer] Starting mobilization run...`);
    
    const result = await agentExecutor.invoke({
      input: "Find low engagement issues and draft mobilization posts.",
    });
    return result;
  } catch (error) {
    console.error("[CommunityMobilizer] Agent Execution Error:", error.message);
    return { output: "Agent execution failed." };
  }
}

module.exports = { runCommunityMobilizer };
