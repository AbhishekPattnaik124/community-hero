const { DynamicTool } = require("@langchain/core/tools");
const AgentAction = require("../../models/AgentAction.model");

const searchLocalTweetsTool = new DynamicTool({
  name: "search_local_tweets",
  description: "Searches Twitter/X for civic complaints in a specific city. Input should be the city name.",
  func: async (city) => {
    // MOCK IMPLEMENTATION FOR HACKATHON
    console.log(`[CivicMind] Searching Twitter for issues in ${city}...`);
    return JSON.stringify([
      { 
        id: "tweet_123", 
        text: `Massive pothole on 5th Avenue in ${city}, someone is going to crash! #fixit`, 
        user: "@angrycitizen", 
        hasImage: true, 
        imageMockUrl: "https://example.com/pothole.jpg" 
      },
      { 
        id: "tweet_124", 
        text: `Streetlight completely broken near Central Park in ${city}. Pitch black.`, 
        user: "@nightwalker", 
        hasImage: false 
      }
    ]);
  },
});

const draftIssueFromTweetTool = new DynamicTool({
  name: "draft_issue_from_tweet",
  description: "Drafts a new civic issue report from a social media post, requiring human approval. Input should be a JSON string containing { title, description, category, severity, tweetId }.",
  func: async (input) => {
    try {
      const payload = JSON.parse(input);
      const action = await AgentAction.create({
        agentName: "AutoReporter",
        actionType: "create_issue_from_social",
        payload,
        reason: `Found actionable civic complaint on Twitter (Tweet ID: ${payload.tweetId})`
      });
      return `Successfully drafted issue. Action ID ${action._id} is pending human approval.`;
    } catch (e) {
      return "Failed to parse input or create action. Ensure input is valid JSON.";
    }
  },
});

module.exports = { searchLocalTweetsTool, draftIssueFromTweetTool };
