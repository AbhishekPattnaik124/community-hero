const { DynamicTool } = require("@langchain/core/tools");
const Issue = require("../../models/Issue.model");
const mongoose = require("mongoose");

const getStaleIssuesTool = new DynamicTool({
  name: "get_stale_issues",
  description: "Finds issues that have been open for more than a specified number of days without being resolved. Input should be the number of days (e.g. '2').",
  func: async (days) => {
    try {
      const daysInt = parseInt(days, 10) || 2;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInt);
      
      const staleIssues = await Issue.find({
        status: { $in: ['open', 'in_progress'] },
        createdAt: { $lt: cutoffDate }
      }).limit(5).populate('assignedAuthority', 'email');
      
      return JSON.stringify(staleIssues);
    } catch (e) {
      return "Failed to fetch stale issues.";
    }
  }
});

const getResolvedIssuesTool = new DynamicTool({
  name: "get_resolved_issues_pending_verification",
  description: "Finds issues that are marked 'resolved' but need agent verification. Input should be an empty string.",
  func: async () => {
    try {
      const resolvedIssues = await Issue.find({
        status: 'resolved'
      }).limit(5);
      return JSON.stringify(resolvedIssues);
    } catch (e) {
      return "Failed to fetch resolved issues.";
    }
  }
});

const getIssueAnalyticsTool = new DynamicTool({
  name: "get_issue_analytics",
  description: "Aggregates issue data to find low engagement issues or historical patterns. Input is 'low_engagement' or 'predictive_patterns'.",
  func: async (type) => {
    try {
      if (type === 'low_engagement') {
        const issues = await Issue.find({ upvoteCount: { $lt: 5 }, status: 'open' }).limit(5);
        return JSON.stringify(issues);
      } else if (type === 'predictive_patterns') {
        // Mocking prediction based on historical data
        return JSON.stringify([
          { location: "Downtown Zone B", predictedIssue: "Water pipe burst", probability: 0.82, recommendedAction: "Preventative inspection" },
          { location: "5th Avenue", predictedIssue: "Pothole expansion", probability: 0.91, recommendedAction: "Immediate resurfacing" }
        ]);
      }
      return "Unknown analytics type.";
    } catch (e) {
      return "Failed to get analytics.";
    }
  }
});

module.exports = { getStaleIssuesTool, getResolvedIssuesTool, getIssueAnalyticsTool };
