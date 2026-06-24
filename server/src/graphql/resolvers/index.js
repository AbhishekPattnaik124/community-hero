const issueService = require('../../services/issue.service');
const Issue = require('../../models/Issue.model');
const User = require('../../models/User.model');
const Comment = require('../../models/Comment.model');
const Notification = require('../../models/Notification.model');
const ApiError = require('../../utils/ApiError');
const { GraphQLScalarType, Kind } = require('graphql');

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  serialize: (val) => (val instanceof Date ? val.toISOString() : val),
  parseValue: (val) => new Date(val),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
});

const resolvers = {
  Date: DateScalar,

  Query: {
    issues: async (_, { filters = {} }, { user }) => {
      const result = await issueService.getIssues(filters);
      return result.issues.length !== undefined
        ? { issues: result.issues, ...result.pagination }
        : result;
    },

    issue: async (_, { id }, { user }) => {
      return issueService.getIssueById(id, user?._id);
    },

    me: async (_, __, { user }) => {
      if (!user) throw new ApiError(401, 'Not authenticated');
      return user;
    },

    user: async (_, { id }) => {
      const u = await User.findById(id).select('-password -refreshToken -googleId');
      if (!u) throw new ApiError(404, 'User not found');
      return u;
    },

    leaderboard: async (_, { limit = 10 }) => {
      return User.find({ isActive: true })
        .sort({ points: -1 })
        .limit(limit)
        .select('name avatar points level badges issuesReported issuesResolved');
    },

    analytics: async (_, { city, days = 30 }) => {
      return issueService.getAnalytics(city, days);
    },

    notifications: async (_, { page = 1, limit = 20 }, { user }) => {
      if (!user) throw new ApiError(401, 'Not authenticated');
      return Notification.find({ recipient: user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    },
  },

  Mutation: {
    createIssue: async (_, { input }, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      const { location, ...rest } = input;
      return issueService.createIssue({
        ...rest,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          address: location.address,
          ward: location.ward,
          city: location.city || 'Unknown',
          pincode: location.pincode,
        },
      }, user);
    },

    updateIssueStatus: async (_, { id, status, note }, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      if (!['authority', 'admin'].includes(user.role)) throw new ApiError(403, 'Not authorized');
      return issueService.updateStatus(id, status, note, user);
    },

    toggleUpvote: async (_, { id }, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      return issueService.toggleUpvote(id, user);
    },

    addComment: async (_, { issueId, text, parentComment }, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      const comment = await Comment.create({
        text,
        author: user._id,
        issue: issueId,
        parentComment: parentComment || null,
        isOfficial: ['authority', 'admin'].includes(user.role),
      });
      await comment.populate('author', 'name avatar role level');
      await Issue.findByIdAndUpdate(issueId, { $inc: { commentCount: 1 } });
      return comment;
    },

    updateProfile: async (_, args, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      return User.findByIdAndUpdate(user._id, args, { new: true, runValidators: true });
    },

    markNotificationsRead: async (_, { ids }, { user }) => {
      if (!user) throw new ApiError(401, 'Authentication required');
      const query = { recipient: user._id, isRead: false };
      if (ids?.length) query._id = { $in: ids };
      await Notification.updateMany(query, { isRead: true, readAt: new Date() });
      return true;
    },
  },
};

module.exports = { resolvers };
