const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getIssueAnalyticsTool } = require("../tools/issue.tools");
const { draftAuthorityEmailTool } = require("../tools/email.tools");
require("dotenv").config();

async function runPredictiveMaintenance() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      temperature: 0.2,
    });

    const tools = [getIssueAnalyticsTool, draftAuthorityEmailTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Predictive Maintenance Agent. Query 'predictive_patterns' analytics to find infrastructure likely to fail. Draft proactive alert emails to the authorities recommending preventative action. Emphasize cost savings."],
      ["human", "Find predictive patterns and alert authorities."],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    console.log(`[PredictiveMaintenance] Starting prediction run...`);
    
    const result = await agentExecutor.invoke({
      input: "Find predictive patterns and alert authorities.",
    });
    return result;
  } catch (error) {
    console.error("[PredictiveMaintenance] Agent Execution Error:", error.message);
    return { output: "Agent execution failed." };
  }
}

module.exports = { runPredictiveMaintenance };
