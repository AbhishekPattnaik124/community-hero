const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getResolvedIssuesTool } = require("../tools/issue.tools");
const { compareBeforeAfterImagesTool, fetchStreetViewImageTool } = require("../tools/vision.tools");
require("dotenv").config();

async function runResolutionVerifier() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      temperature: 0,
    });

    const tools = [getResolvedIssuesTool, fetchStreetViewImageTool, compareBeforeAfterImagesTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Resolution Verifier Agent. Find issues marked as resolved. For each, fetch the latest Street View image of the location, and compare it with the original issue image using the Vision AI tool to verify if it is ACTUALLY resolved."],
      ["human", "Verify recently resolved issues."],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    console.log(`[ResolutionVerifier] Starting verification run...`);
    
    const result = await agentExecutor.invoke({
      input: "Verify recently resolved issues.",
    });
    return result;
  } catch (error) {
    console.error("[ResolutionVerifier] Agent Execution Error:", error.message);
    return { output: "Agent execution failed." };
  }
}

module.exports = { runResolutionVerifier };
