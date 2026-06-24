const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: { type: String, sparse: true, unique: true },
    googleToken: { type: String, select: false },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    avatar: { type: String, default: null },
    role: {
      type: String,
      enum: ['citizen', 'authority', 'admin'],
      default: 'citizen',
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Gamification & Reputation
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    
    // Streaks
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveAt: { type: Date },

    // Stats
    issuesReported: { type: Number, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    upvotesGiven: { type: Number, default: 0 },

    // Location preferences
    defaultLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      address: String,
    },

    // Detailed Notification preferences
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      preferences: {
        mentions: { type: Boolean, default: true },
        issueUpdates: { type: Boolean, default: true },
        newsletters: { type: Boolean, default: false },
        criticalAlerts: { type: Boolean, default: true },
      }
    },

    // Activity History
    activityHistory: [activitySchema],

    phone: { type: String, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    truecallerName: { type: String, default: null },
    fakeReports: { type: Number, default: 0 },
    bio: { type: String, maxlength: 200 },

    // Token management
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ defaultLocation: '2dsphere' });
userSchema.index({ points: -1 }); // For leaderboards

// Virtual: full avatar URL
userSchema.virtual('avatarUrl').get(function () {
  return this.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${this.name}`;
});

// Pre-save hook: Handle Streaks and Hash password
userSchema.pre('save', async function (next) {
  // Hash password
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Handle streak calculation if lastActiveAt is modified
  if (this.isModified('lastActiveAt') && this.lastActiveAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(this.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      this.currentStreak = 1;
    }

    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  }

  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: log activity
userSchema.methods.logActivity = async function (action, metadata = {}) {
  this.activityHistory.push({ action, metadata, timestamp: new Date() });
  // keep last 100 activities
  if (this.activityHistory.length > 100) {
    this.activityHistory.shift();
  }
  await this.save();
};

// Method: add points & check level up
userSchema.methods.addPoints = async function (points) {
  this.points += points;
  const newLevel = Math.floor(this.points / 100) + 1;
  let leveledUp = false;
  
  if (newLevel > this.level) {
    this.level = newLevel;
    leveledUp = true;
    this.activityHistory.push({ action: 'level_up', metadata: { newLevel }, timestamp: new Date() });
  }
  
  await this.save();
  return { leveledUp, newLevel: this.level };
};

const User = mongoose.model('User', userSchema);
module.exports = User;
