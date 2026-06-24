const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getStaleIssuesTool } = require("../tools/issue.tools");
const { draftAuthorityEmailTool } = require("../tools/email.tools");
require("dotenv").config();

async function runAuthorityLiaison(daysStale = 2) {
  try {
    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
      temperature: 0,
    });

    const tools = [getStaleIssuesTool, draftAuthorityEmailTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Authority Liaison Agent. Your job is to fetch stale issues that haven't been resolved in {days} days, and draft follow-up emails to the assigned authorities. Be professional but firm. The drafted emails require human approval."],
      ["human", "Check for issues stale for {days} days and draft emails."],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    console.log(`[AuthorityLiaison] Checking for issues stale for ${daysStale} days...`);
    
    const result = await agentExecutor.invoke({
      days: daysStale.toString(),
    });
    return result;
  } catch (error) {
    console.error("[AuthorityLiaison] Agent Execution Error:", error.message);
    return { output: "Agent execution failed." };
  }
}

module.exports = { runAuthorityLiaison };
