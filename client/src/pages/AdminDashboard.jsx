import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Filter, Search, ChevronDown, MapPin, Star, Users
} from 'lucide-react';
import { issuesApi } from '@api/issues.api';
import { usersApi } from '@api/users.api';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import { SkeletonCard } from '@components/ui/Skeleton';
import { CATEGORY_ICONS, STATUS_LABELS, timeAgo, cn } from '@utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['open', 'in_progress', 'resolved', 'escalated', 'closed'];
const STATUS_ACTIONS = {
  open: [{ value: 'in_progress', label: 'Start Working', color: 'warning' }],
  in_progress: [
    { value: 'resolved', label: 'Mark Resolved', color: 'success' },
    { value: 'escalated', label: 'Escalate', color: 'danger' },
  ],
  escalated: [{ value: 'in_progress', label: 'Take Over', color: 'warning' }],
  resolved: [{ value: 'closed', label: 'Close Issue', color: 'default' }],
  closed: [],
};

function IssueAdminRow({ issue, onStatusChange }) {
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const actions = STATUS_ACTIONS[issue.status] || [];

  const handleAction = (status) => {
    setPendingStatus(status);
    setShowNote(true);
  };

  const confirm = () => {
    onStatusChange(issue._id, pendingStatus, note);
    setShowNote(false);
    setNote('');
    setPendingStatus(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{CATEGORY_ICONS[issue.category]}</span>
        <div className="flex-1 min-w-0">
          <Link to={`/issue/${issue._id}`} className="group">
            <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">
              {issue.title}
            </p>
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full status-${issue.status}`}>
              {STATUS_LABELS[issue.status]}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={10} /> {issue.location?.city || 'Unknown'}
            </span>
            <span className="text-xs text-slate-400">⭐ {issue.upvoteCount}</span>
            <span className="text-xs text-slate-500">{timeAgo(issue.createdAt)}</span>
          </div>
        </div>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex gap-1.5 shrink-0">
            {actions.map((action) => (
              <Button
                key={action.value}
                size="xs"
                variant={action.color === 'success' ? 'primary' : action.color === 'danger' ? 'danger' : 'secondary'}
                onClick={() => handleAction(action.value)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Note input */}
      {showNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 pt-3 border-t border-white/5"
        >
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for this status change (optional)..."
            className="w-full px-3 py-2 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-primary-500/50"
          />
          <div className="flex gap-2 mt-2">
            <Button size="xs" onClick={confirm}>Confirm</Button>
            <Button size="xs" variant="ghost" onClick={() => setShowNote(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState('open');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['issues', 'admin', statusFilter, search],
    queryFn: () => issuesApi.getAll({
      status: statusFilter || undefined,
      search: search || undefined,
      limit: 30,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    refetchInterval: 15000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => issuesApi.getAnalytics({}),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'admin'],
    queryFn: () => usersApi.getLeaderboard(5),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }) => issuesApi.update(id, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue status updated');
    },
  });

  const issues = data?.data || [];
  const analytics = analyticsData?.data;

  const summaryStats = [
    {
      label: 'Open Issues',
      value: analytics?.statusBreakdown?.find((s) => s._id === 'open')?.count || 0,
      icon: <AlertTriangle size={20} />,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      label: 'In Progress',
      value: analytics?.statusBreakdown?.find((s) => s._id === 'in_progress')?.count || 0,
      icon: <Clock size={20} />,
      color: 'text-yellow-400 bg-yellow-500/10',
    },
    {
      label: 'Resolved',
      value: analytics?.statusBreakdown?.find((s) => s._id === 'resolved')?.count || 0,
      icon: <CheckCircle size={20} />,
      color: 'text-green-400 bg-green-500/10',
    },
    {
      label: 'Escalated',
      value: analytics?.statusBreakdown?.find((s) => s._id === 'escalated')?.count || 0,
      icon: <TrendingUp size={20} />,
      color: 'text-red-400 bg-red-500/10',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Authority Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage and resolve community issues</p>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Issues panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex gap-1 glass rounded-xl p-1 border border-white/8">
              {['', ...STATUSES].map((s) => (
                <button
                  key={s || 'all'}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    statusFilter === s
                      ? 'bg-primary-500/30 text-primary-300'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Issues list */}
          <div className="space-y-3">
            {isLoading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : issues.length === 0
                ? (
                  <div className="text-center py-16 text-slate-500">
                    <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No issues found for this filter.</p>
                  </div>
                )
                : issues.map((issue) => (
                  <IssueAdminRow
                    key={issue._id}
                    issue={issue}
                    onStatusChange={(id, status, note) => statusMutation.mutate({ id, status, note })}
                  />
                ))
            }
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Top Issues */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Star size={14} className="text-warning-400" /> Most Upvoted
            </h3>
            <div className="space-y-2">
              {(analytics?.topIssues || []).map((issue, i) => (
                <Link key={issue._id} to={`/issue/${issue._id}`}>
                  <div className="flex items-start gap-2 py-1.5 hover:bg-white/3 rounded-lg px-1 transition-colors">
                    <span className="text-xs font-bold text-slate-500 w-4 shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{issue.title}</p>
                      <p className="text-xs text-slate-500">⭐ {issue.upvoteCount}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary-400" /> Category Breakdown
            </h3>
            <div className="space-y-2">
              {(analytics?.categoryBreakdown || []).slice(0, 6).map((cat) => (
                <div key={cat._id} className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat._id]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-300 capitalize">{cat._id}</span>
                      <span className="text-slate-500">{cat.count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (cat.count / (analytics?.categoryBreakdown?.[0]?.count || 1)) * 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
