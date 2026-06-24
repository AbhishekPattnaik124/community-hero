const gql = require('graphql-tag');

const typeDefs = gql`
  scalar Date

  enum IssueStatus { open in_progress resolved closed escalated }
  enum IssueCategory { roads water electricity sanitation parks safety noise other }
  enum IssueSeverity { low medium high critical }
  enum UserRole { citizen authority admin }

  type Location {
    type: String
    coordinates: [Float]
    address: String
    ward: String
    city: String
    pincode: String
  }

  type TimelineEntry {
    status: IssueStatus
    note: String
    timestamp: Date
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    role: UserRole!
    avatar: String
    avatarUrl: String
    points: Int
    level: Int
    badges: [String]
    issuesReported: Int
    issuesResolved: Int
    createdAt: Date
  }

  type Issue {
    _id: ID!
    title: String!
    description: String!
    category: IssueCategory!
    status: IssueStatus!
    severity: IssueSeverity!
    location: Location!
    images: [String]
    upvoteCount: Int!
    commentCount: Int!
    viewCount: Int!
    daysOpen: Int
    reporter: User
    assignedTo: User
    timeline: [TimelineEntry]
    tags: [String]
    createdAt: Date!
    updatedAt: Date!
  }

  type Comment {
    _id: ID!
    text: String!
    author: User!
    issue: ID!
    isOfficial: Boolean
    likeCount: Int
    createdAt: Date!
  }

  type Notification {
    _id: ID!
    type: String!
    title: String!
    message: String!
    link: String
    isRead: Boolean!
    createdAt: Date!
  }

  type CategoryStat {
    _id: String
    count: Int
    avgUpvotes: Float
  }

  type StatusStat {
    _id: String
    count: Int
  }

  type TrendPoint {
    _id: String
    count: Int
    resolved: Int
  }

  type Analytics {
    categoryBreakdown: [CategoryStat]
    statusBreakdown: [StatusStat]
    trend: [TrendPoint]
    topIssues: [Issue]
  }

  type PaginatedIssues {
    issues: [Issue]
    total: Int
    page: Int
    pages: Int
    hasNext: Boolean
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type UpvoteResult {
    upvoteCount: Int!
    hasUpvoted: Boolean!
  }

  input LocationInput {
    lat: Float!
    lng: Float!
    address: String
    ward: String
    city: String
    pincode: String
  }

  input CreateIssueInput {
    title: String!
    description: String!
    category: IssueCategory!
    severity: IssueSeverity
    location: LocationInput!
    tags: [String]
  }

  input IssueFiltersInput {
    status: IssueStatus
    category: IssueCategory
    severity: IssueSeverity
    city: String
    search: String
    lat: Float
    lng: Float
    radius: Float
    page: Int
    limit: Int
    sortBy: String
    sortOrder: String
  }

  type Query {
    issues(filters: IssueFiltersInput): PaginatedIssues!
    issue(id: ID!): Issue
    me: User
    user(id: ID!): User
    leaderboard(limit: Int): [User]
    analytics(city: String, days: Int): Analytics
    notifications(page: Int, limit: Int): [Notification]
  }

  type Mutation {
    createIssue(input: CreateIssueInput!): Issue!
    updateIssueStatus(id: ID!, status: IssueStatus!, note: String): Issue!
    toggleUpvote(id: ID!): UpvoteResult!
    addComment(issueId: ID!, text: String!, parentComment: ID): Comment!
    updateProfile(name: String, bio: String, phone: String): User!
    markNotificationsRead(ids: [ID]): Boolean
  }
`;

module.exports = { typeDefs };
