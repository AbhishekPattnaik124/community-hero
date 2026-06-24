import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, Clock, Star, MessageSquare,
  Share2, Flag, CheckCircle, ChevronDown, ChevronUp, Send, Users, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { issuesApi } from '@api/issues.api';
import { useSocket } from '@context/SocketContext';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Card from '@components/ui/Card';
import { SkeletonCard, Skeleton } from '@components/ui/Skeleton';
import { CATEGORY_ICONS, STATUS_LABELS, SEVERITY_COLORS, timeAgo, formatDate, cn } from '@utils/helpers';
import toast from 'react-hot-toast';

function StatusTimeline({ timeline }) {
  return (
    <div className="space-y-3">
      {timeline.map((entry, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center">
            <div className={cn('w-3 h-3 rounded-full border-2 shrink-0 mt-0.5',
              entry.status === 'resolved' ? 'bg-success-400 border-success-400' :
              entry.status === 'escalated' ? 'bg-danger-400 border-danger-400' :
              entry.status === 'in_progress' ? 'bg-warning-400 border-warning-400' :
              'bg-primary-400 border-primary-400'
            )} />
            {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-white/5 my-1" />}
          </div>
          <div className="pb-3 flex-1">
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block status-${entry.status}`}>
              {STATUS_LABELS[entry.status]}
            </p>
            {entry.note && <p className="text-slate-400 text-xs mt-1">{entry.note}</p>}
            <p className="text-slate-600 text-xs mt-1">{formatDate(entry.timestamp)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CommentItem({ comment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 py-3 border-b border-white/5 last:border-0', comment.isOfficial && 'bg-primary-500/5 -mx-4 px-4 rounded-xl')}
    >
      <img
        src={comment.author?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${comment.author?.name}`}
        alt={comment.author?.name}
        className="w-8 h-8 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{comment.author?.name}</span>
          {comment.isOfficial && <Badge variant="primary" size="xs">Official Response</Badge>}
          <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-slate-300 text-sm mt-1 leading-relaxed">{comment.text}</p>
      </div>
    </motion.div>
  );
}

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);
  const [activeViewers, setActiveViewers] = useState(1);
  const [severityScore, setSeverityScore] = useState(50);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: issueData, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getById(id),
  });

  // Handle Socket Events
  useEffect(() => {
    if (socket && issueData?.data?.issue) {
      socket.emit('join:issue', id);
      setSeverityScore(issueData.data.issue.severityScore || 50);

      const handleViewersChanged = ({ count }) => setActiveViewers(count);
      const handleCommentAdded = (comment) => {
        // Optimistically update comments query
        queryClient.setQueryData(['comments', id], (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, data: [...oldData.data, comment] };
        });
      };
      const handleSeverityUpdated = ({ severityScore }) => setSeverityScore(severityScore);
      const handleIssueUpvoted = () => queryClient.invalidateQueries({ queryKey: ['issue', id] });

      socket.on('issue:viewers_changed', handleViewersChanged);
      socket.on('comment:added', handleCommentAdded);
      socket.on('issue:severity_updated', handleSeverityUpdated);
      socket.on('issue:upvoted', handleIssueUpvoted);

      return () => {
        socket.emit('leave:issue', id);
        socket.off('issue:viewers_changed', handleViewersChanged);
        socket.off('comment:added', handleCommentAdded);
        socket.off('issue:severity_updated', handleSeverityUpdated);
        socket.off('issue:upvoted', handleIssueUpvoted);
      };
    }
  }, [socket, issueData, id, queryClient]);

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => issuesApi.getComments(id),
  });

  const upvoteMutation = useMutation({
    mutationFn: () => issuesApi.toggleUpvote(id),
    onSuccess: (res) => {
      // Handled via socket
      toast.success(res.data.hasUpvoted ? 'Upvoted! ⭐' : 'Upvote removed');
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => issuesApi.addComment(id, { text: commentText }),
    onSuccess: () => {
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const severityMutation = useMutation({
    mutationFn: (score) => issuesApi.api.post(`/issues/${id}/severity`, { score }),
    onSuccess: () => {
      toast.success('Severity vote recorded');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const issue = issueData?.data?.issue;
  if (!issue) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <p className="text-slate-400">Issue not found.</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>Go back</Button>
    </div>
  );

  const comments = commentsData?.data || [];
  const hasUpvoted = user && issue.upvotes?.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Active Viewers & Back */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Back
        </Button>
        {activeViewers > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-medium text-warning-400 bg-warning-500/10 px-3 py-1.5 rounded-full border border-warning-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-500"></span>
            </span>
            {activeViewers} people are viewing this right now
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Issue header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{CATEGORY_ICONS[issue.category]}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white leading-snug">{issue.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full status-${issue.status}`}>
                    {STATUS_LABELS[issue.status]}
                  </span>
                  <Badge variant="default" size="xs" className={SEVERITY_COLORS[issue.severity]}>
                    {issue.severity} severity
                  </Badge>
                  <span className="text-xs text-slate-400 capitalize">{issue.category}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-5">{issue.description}</p>

            {/* Images */}
            {issue.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {issue.images.map((img, i) => (
                  <img key={i} src={img} alt={`Issue image ${i + 1}`}
                    className="rounded-xl object-cover aspect-video w-full hover:opacity-80 transition-opacity cursor-zoom-in" />
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(issue.createdAt)}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {issue.location?.address || issue.location?.city || 'Unknown'}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {issue.commentCount} comments</span>
              <span className="flex items-center gap-1"><Star size={12} /> {issue.upvoteCount} upvotes</span>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={hasUpvoted ? 'primary' : 'secondary'}
              size="sm"
              icon={<Star size={16} />}
              onClick={() => isAuthenticated ? upvoteMutation.mutate() : navigate('/login')}
              loading={upvoteMutation.isPending}
            >
              {hasUpvoted ? 'Upvoted' : 'Upvote'} ({issue.upvoteCount})
            </Button>
            <Button variant="secondary" size="sm" icon={<Share2 size={16} />}
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
              Share
            </Button>
            <Button variant="ghost" size="sm" icon={<Flag size={14} />}>Report</Button>
          </div>

          {/* Comments */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary-400" />
              Comments ({issue.commentCount})
            </h2>

            {isAuthenticated && (
              <div className="flex gap-3 mb-5">
                <img
                  src={user?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${user?.name}`}
                  alt="You"
                  className="w-8 h-8 rounded-xl shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && commentMutation.mutate()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 transition-all"
                  />
                  <Button size="sm" icon={<Send size={14} />}
                    onClick={() => commentMutation.mutate()}
                    loading={commentMutation.isPending}
                    disabled={!commentText.trim()} />
                </div>
              </div>
            )}

            {commentsLoading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} className="mb-2" />)
              : comments.length === 0
                ? <p className="text-slate-500 text-sm text-center py-6">No comments yet. Be the first!</p>
                : comments.map((c) => <CommentItem key={c._id} comment={c} />)
            }
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Reporter */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Reported by</h3>
            <div className="flex items-center gap-3">
              <img
                src={issue.reporter?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${issue.reporter?.name}`}
                alt={issue.reporter?.name}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <p className="text-sm font-medium text-white">{issue.reporter?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="primary" size="xs">Lv.{issue.reporter?.level || 1}</Badge>
                  <span className="text-xs text-slate-500">{issue.reporter?.role}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">{formatDate(issue.createdAt)}</p>
          </Card>

          {/* Severity Voting */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning-400" /> Crowd Severity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Low</span>
                <span className="text-sm font-bold text-white">{severityScore}/100</span>
                <span className="text-xs text-slate-400">Critical</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={severityScore}
                onChange={(e) => setSeverityScore(Number(e.target.value))}
                onMouseUp={() => isAuthenticated ? severityMutation.mutate(severityScore) : navigate('/login')}
                onTouchEnd={() => isAuthenticated ? severityMutation.mutate(severityScore) : navigate('/login')}
                className="w-full accent-primary-500"
              />
              <p className="text-xs text-slate-500 text-center">Drag to vote on the true severity</p>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-primary-400" /> Location
            </h3>
            <p className="text-sm text-slate-300">{issue.location?.address || 'No address provided'}</p>
            {issue.location?.city && <p className="text-xs text-slate-500 mt-1">{issue.location.city}{issue.location.pincode ? ` – ${issue.location.pincode}` : ''}</p>}
            <p className="text-xs text-slate-600 font-mono mt-2">
              {issue.location?.coordinates?.[1]?.toFixed(5)}, {issue.location?.coordinates?.[0]?.toFixed(5)}
            </p>
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full flex items-center justify-between text-sm font-semibold text-white mb-3"
            >
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-success-400" /> Status Timeline
              </span>
              {showTimeline ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {showTimeline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <StatusTimeline timeline={[{ status: 'open', timestamp: issue.createdAt }, ...(issue.timeline || [])]} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Tags */}
          {issue.tags?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {issue.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
