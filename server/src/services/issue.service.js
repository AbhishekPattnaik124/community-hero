const Issue = require('../models/Issue.model');
const Comment = require('../models/Comment.model');
const User = require('../models/User.model');
const cache = require('./cache.service');
const { emit } = require('./socket.service');
const { notifyUpvote, notifyStatusChange } = require('./notification.service');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const rourkelaEngine = require('../cities/rourkela/rourkela.engine');
const kolkataEngine = require('../cities/kolkata/kolkata.engine');
const indiaEngine = require('../cities/india.engine');
const deduplicationService = require('./deduplication.service');
const fraudScorerService = require('./fraudScorer.service');
const environmentService = require('./environment.service');

/**
 * Create a new issue
 */
async function createIssue(data, reporter) {
  // 1. Deduplication / Auto-Merge Logic
  if (data.location && data.location.coordinates) {
    const lat = data.location.coordinates[1];
    const lng = data.location.coordinates[0];
    
    const duplicate = await deduplicationService.findDuplicate(data.category, lat, lng);
    if (duplicate) {
      // Auto-merge as an upvote instead of creating a new issue
      logger.info(`Duplicate detected! Auto-merging issue by ${reporter._id} into parent ${duplicate._id}`);
      
      if (!duplicate.upvotes.includes(reporter._id)) {
        duplicate.upvotes.push(reporter._id);
        duplicate.upvoteCount += 1;
        await duplicate.save();
      }
      
      return duplicate; // Return parent issue
    }
  }

  // Hyper-Local City Routing Logic
  if (data.location && data.location.city && data.location.coordinates) {
    const city = data.location.city.toLowerCase();
    const lng = data.location.coordinates[0];
    const lat = data.location.coordinates[1];
    
    if (city === 'rourkela') {
      const authString = rourkelaEngine.determineAuthority(lat, lng);
      const authorityUser = await User.findOne({ name: authString, role: 'authority' });
      if (authorityUser) {
        data.assignedAuthority = authorityUser._id;
        data.assignedTo = authorityUser._id;
      } else {
        delete data.assignedAuthority;
        delete data.assignedTo;
      }
    } else if (city === 'kolkata') {
      const heritageCheck = kolkataEngine.heritageBuildingCheck(lat, lng);
      if (heritageCheck.isHeritage) {
        data.tags = data.tags || [];
        if (!data.tags.includes('HERITAGE')) data.tags.push('HERITAGE');
        const authorityUser = await User.findOne({ name: heritageCheck.department, role: 'authority' });
        if (authorityUser) {
          data.assignedAuthority = authorityUser._id;
          data.assignedTo = authorityUser._id;
        } else {
          delete data.assignedAuthority;
          delete data.assignedTo;
        }
      }
    } else {
      // Unified India Fallback Engine
      const authString = indiaEngine.determineAuthority(data.location.city, data.location.state);
      const authorityUser = await User.findOne({ name: authString, role: 'authority' });
      if (authorityUser) {
        data.assignedAuthority = authorityUser._id;
        data.assignedTo = authorityUser._id;
      } else {
        delete data.assignedAuthority;
        delete data.assignedTo;
      }
    }
  }

  // Calculate Fraud Score using ML model
  const fraudAnalysis = await fraudScorerService.calculateFraudScore(data, reporter, data.fraudFlags);
  
  // Calculate SLA Deadline
  let slaDays = 7; // Default 7 days
  const cat = data.category ? data.category.toLowerCase() : '';
  if (cat.includes('water')) slaDays = 1; // 24 hours
  if (cat.includes('garbage')) slaDays = 2; // 48 hours
  if (cat.includes('light')) slaDays = 3; // 72 hours
  if (cat.includes('pothole')) slaDays = 7; // 7 days

  const slaDeadline = new Date();
  slaDeadline.setDate(slaDeadline.getDate() + slaDays);

  // Assess Environmental Impact
  const envImpact = await environmentService.assessImpact(data);

  const issue = await Issue.create({ 
    ...data, 
    reporter: reporter._id,
    fraudScore: fraudAnalysis.score,
    isFake: fraudAnalysis.isFake,
    fraudFlags: data.fraudFlags || [],
    slaDeadline,
    carbonImpactKg: envImpact.carbonImpactKg,
    healthRiskScore: envImpact.healthRiskScore,
    aqiSpike: envImpact.aqiSpike
  });
  
  await issue.populate('reporter', 'name avatar role');

  if (issue.isFake) {
    logger.warn(`Issue ${issue._id} flagged as FAKE by ML Model. Score: ${fraudAnalysis.score}`);
    // Optional: emit to admin dashboard for review
  } else {
    // Award points only for legit reporting
    await reporter.addPoints(10);
    await User.findByIdAndUpdate(reporter._id, { $inc: { issuesReported: 1 } });
    // Emit real-time event
    emit.issueCreated(issue.toObject());
  }

  // Invalidate city cache
  await cache.invalidatePattern(`issues:city:${issue.location.city}:*`);

  logger.info(`Issue created: ${issue._id} by user ${reporter._id}`);
  return issue;
}

/**
 * Get issues with filters, pagination, and geospatial support
 */
async function getIssues({ page = 1, limit = 20, status, category, severity, reporter, lat, lng, radius = 5, city, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
  const query = { isArchived: { $ne: true } };

  if (status) query.status = status;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (reporter) query.reporter = reporter;
  if (city) query['location.city'] = city;
  if (city) query['location.city'] = city;

  // Full-text search
  if (search) query.$text = { $search: search };

  // Geospatial: within a radius
  if (lat && lng) {
    query.location = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1],
      },
    };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [issues, total] = await Promise.all([
    Issue.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'name avatar role')
      .populate('assignedTo', 'name avatar role')
      .lean(),
    Issue.countDocuments(query),
  ]);

  return {
    issues,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get single issue by ID
 */
async function getIssueById(id, userId) {
  const issue = await Issue.findById(id)
    .populate('reporter', 'name avatar role level badges')
    .populate('assignedTo', 'name avatar role')
    .populate({ path: 'timeline.changedBy', select: 'name avatar' });

  if (!issue) throw ApiError.notFound('Issue not found');
  if (issue.isArchived) throw ApiError.notFound('Issue not found');

  // Increment view count via Redis (batch flush to DB)
  await cache.increment(`issue:views:${id}`);

  return issue;
}

/**
 * Toggle upvote on an issue
 */
async function toggleUpvote(issueId, user) {
  const issue = await Issue.findById(issueId);
  if (!issue) throw ApiError.notFound('Issue not found');

  const hasUpvoted = issue.upvotes.includes(user._id);

  if (hasUpvoted) {
    issue.upvotes.pull(user._id);
  } else {
    issue.upvotes.push(user._id);
    await notifyUpvote(issue, user);
    await user.addPoints(2);
  }

  await issue.save();
  emit.issueUpvoted(issueId, { upvoteCount: issue.upvoteCount, hasUpvoted: !hasUpvoted });

  return { upvoteCount: issue.upvoteCount, hasUpvoted: !hasUpvoted };
}

/**
 * Update issue status (authority/admin only)
 */
async function updateStatus(issueId, newStatus, note, changedBy) {
  const issue = await Issue.findById(issueId).populate('reporter', 'name email notifications');
  if (!issue) throw ApiError.notFound('Issue not found');

  issue.status = newStatus;
  issue.timeline.push({ status: newStatus, changedBy: changedBy._id, note });

  if (newStatus === 'resolved') {
    issue.resolvedAt = new Date();
    // Award points to reporter
    await User.findByIdAndUpdate(issue.reporter._id, {
      $inc: { points: 50, issuesResolved: 1 },
    });
  }

  await issue.save();
  emit.issueStatusChanged(issue.toObject());
  await notifyStatusChange(issue, changedBy);
  await cache.invalidatePattern(`issues:*`);

  return issue;
}

/**
 * Analytics aggregation pipeline
 */
async function getAnalytics(city, days = 30) {
  const cacheKey = `analytics:${city}:${days}`;
  return cache.getOrSet(cacheKey, async () => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = {
      isArchived: false,
      createdAt: { $gte: since },
      ...(city && { 'location.city': city }),
    };

    const [categoryBreakdown, statusBreakdown, trend, topIssues] = await Promise.all([
      Issue.aggregate([
        { $match: matchStage },
        { $group: { _id: '$category', count: { $sum: 1 }, avgUpvotes: { $avg: '$upvoteCount' } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Issue.find({ ...matchStage, status: { $ne: 'resolved' } })
        .sort({ upvoteCount: -1 })
        .limit(5)
        .select('title category upvoteCount status')
        .lean(),
    ]);

    return { categoryBreakdown, statusBreakdown, trend, topIssues };
  }, 600); // 10 min cache
}

/**
 * Vote on issue severity
 */
async function voteSeverity(issueId, user, score) {
  const issue = await Issue.findById(issueId);
  if (!issue) throw ApiError.notFound('Issue not found');

  const existingVoteIndex = issue.severityVotes.findIndex(v => v.user.toString() === user._id.toString());
  
  if (existingVoteIndex >= 0) {
    issue.severityVotes[existingVoteIndex].score = score;
  } else {
    issue.severityVotes.push({ user: user._id, score });
  }

  // Calculate new average
  const totalScore = issue.severityVotes.reduce((sum, v) => sum + v.score, 0);
  issue.severityScore = Math.round(totalScore / issue.severityVotes.length);

  // Auto-escalate if average crosses threshold
  if (issue.severityScore > 80 && issue.severity !== 'critical') {
    issue.severity = 'critical';
    // Optionally emit critical alert here
  }

  await issue.save();
  emit.issueSeverityVoted(issueId, issue.severityScore);

  return { severityScore: issue.severityScore, myVote: score };
}

module.exports = { createIssue, getIssues, getIssueById, toggleUpvote, updateStatus, getAnalytics, voteSeverity };
