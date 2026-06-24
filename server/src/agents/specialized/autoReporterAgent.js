const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { searchLocalTweetsTool, draftIssueFromTweetTool } = require("../tools/twitter.tools");
require("dotenv").config();

async function runAutoReporter(city) {
  // In a real scenario, this relies on a valid GEMINI_API_KEY
  // For the hackathon, if it fails due to auth, we'll log it
  try {
    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      temperature: 0,
    });

    const tools = [searchLocalTweetsTool, draftIssueFromTweetTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Auto-Reporter Agent for CivicMind. Your job is to search local social media for civic complaints, and if you find actionable issues (like potholes, broken lights), use the draft tool to create a pending issue report. ONLY draft reports for genuine civic issues."],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    console.log(`[AutoReporter] Starting run for city: ${city}`);
    
    const result = await agentExecutor.invoke({
      input: `Find civic complaints in ${city} on Twitter and draft issue reports for them.`,
    });
    return result;
  } catch (error) {
    console.error("[AutoReporter] Agent Execution Error:", error.message);
    return { output: "Agent execution failed. Did you configure GEMINI_API_KEY?" };
  }
}

module.exports = { runAutoReporter };
