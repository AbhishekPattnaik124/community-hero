const { Server } = require('socket.io');
const logger = require('../config/logger');

let io = null;
const issueViewers = new Map(); // issueId -> Set(userIds)

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication token required'));

    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} (user: ${socket.userId}, role: ${socket.userRole})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-based room (for War Room / Dashboards)
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Join city room for broadcast updates
    socket.on('join:city', (city) => {
      socket.join(`city:${city}`);
      logger.debug(`User ${socket.userId} joined city room: ${city}`);
    });

    // Join issue room for real-time comments & active viewers
    socket.on('join:issue', (issueId) => {
      socket.join(`issue:${issueId}`);
      if (!issueViewers.has(issueId)) issueViewers.set(issueId, new Set());
      issueViewers.get(issueId).add(socket.userId);
      
      io.to(`issue:${issueId}`).emit('issue:viewers_changed', { 
        issueId, 
        count: issueViewers.get(issueId).size 
      });
    });

    socket.on('leave:issue', (issueId) => {
      socket.leave(`issue:${issueId}`);
      if (issueViewers.has(issueId)) {
        issueViewers.get(issueId).delete(socket.userId);
        io.to(`issue:${issueId}`).emit('issue:viewers_changed', { 
          issueId, 
          count: issueViewers.get(issueId).size 
        });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', ({ issueId }) => {
      socket.to(`issue:${issueId}`).emit('user:typing', { userId: socket.userId });
    });

    socket.on('typing:stop', ({ issueId }) => {
      socket.to(`issue:${issueId}`).emit('user:stopped-typing', { userId: socket.userId });
    });
    
    // Field Officer Tracking
    socket.on('officer:location_update', (data) => {
       if (socket.userRole === 'authority' || socket.userRole === 'admin') {
         io.to('role:admin').to('role:authority').emit('officer:location_updated', {
           userId: socket.userId,
           location: data
         });
       }
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} – ${reason}`);
      // Remove from all issueViewers sets
      for (const [issueId, users] of issueViewers.entries()) {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          io.to(`issue:${issueId}`).emit('issue:viewers_changed', { 
            issueId, 
            count: users.size 
          });
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Emit helpers
const emit = {
  issueCreated: (issue) => {
    io?.to(`city:${issue.location.city}`).emit('issue:created', issue);
    // Alert War Room globally if severity is high
    if (issue.severity >= 80) {
       io?.to('role:admin').to('role:authority').emit('issue:critical_alert', issue);
    }
  },
  issueUpdated: (issue) => io?.to(`city:${issue.location.city}`).emit('issue:updated', issue),
  issueStatusChanged: (issue) => {
    io?.to(`issue:${issue._id}`).emit('issue:status-changed', issue);
    io?.to(`city:${issue.location.city}`).emit('issue:status-changed', issue);
  },
  commentAdded: (issueId, comment) => io?.to(`issue:${issueId}`).emit('comment:added', comment),
  notification: (userId, notification) => io?.to(`user:${userId}`).emit('notification', notification),
  issueUpvoted: (issueId, data) => io?.to(`issue:${issueId}`).emit('issue:upvoted', data),
  issueSeverityVoted: (issueId, newAverage) => io?.to(`issue:${issueId}`).emit('issue:severity_updated', { issueId, severityScore: newAverage })
};

module.exports = { initSocket, getIO, emit };
