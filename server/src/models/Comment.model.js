const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false });

const commentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // For nested threading
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    // The rich text content
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    // Arrays of user mentions (e.g., @johndoe) parsed from text
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    isOfficial: {
      type: Boolean,
      default: false,
    },
    
    // Engagement
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    
    // Emoji Reactions
    reactions: [reactionSchema],

    // Editing metadata
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    
    // Status
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Standard query: getting top-level comments for an issue
commentSchema.index({ issue: 1, parentComment: 1, createdAt: -1 });
// Querying replies to a specific comment
commentSchema.index({ parentComment: 1, createdAt: 1 });
// User's comments
commentSchema.index({ author: 1, createdAt: -1 });

// Virtual to auto-populate replies (if doing a manual populate chain)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { sort: { createdAt: 1 } }
});

// Middleware: auto-update upvoteCount
commentSchema.pre('save', function (next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  
  // Tag as edited if text changes and it isn't brand new
  if (this.isModified('text') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

// Post-save middleware to increment/decrement issue commentCount
commentSchema.post('save', async function (doc, next) {
  if (doc.isNew) {
    const Issue = mongoose.model('Issue');
    await Issue.findByIdAndUpdate(doc.issue, { $inc: { commentCount: 1 } });
  }
  next();
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
