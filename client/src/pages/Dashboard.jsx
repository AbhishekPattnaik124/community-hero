import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp, AlertCircle, CheckCircle2, Clock,
  MapPin, Star, Flame, Plus, ArrowUpRight, Users
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { issuesApi } from '@api/issues.api';
import { usersApi } from '@api/users.api';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import { SkeletonCard } from '@components/ui/Skeleton';
import { CATEGORY_ICONS, STATUS_LABELS, timeAgo, truncate } from '@utils/helpers';

function StatCard({ label, value, icon, delta, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      {delta !== undefined && (
        <div className="text-xs text-success-400 flex items-center gap-0.5 shrink-0">
          <TrendingUp size={12} /> +{delta}
        </div>
      )}
    </motion.div>
  );
}

function IssueRow({ issue }) {
  return (
    <Link to={`/issue/${issue._id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 cursor-pointer group"
      >
        <span className="text-lg mt-0.5 shrink-0">{CATEGORY_ICONS[issue.category]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">
            {issue.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full status-${issue.status}`}>
              {STATUS_LABELS[issue.status]}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={10} /> {issue.location?.city || 'Unknown'}
            </span>
            <span className="text-xs text-slate-500">{timeAgo(issue.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <Star size={12} />
          <span className="text-xs">{issue.upvoteCount}</span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', 'dashboard'],
    queryFn: () => issuesApi.getAll({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => issuesApi.getAnalytics({}),
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => usersApi.getLeaderboard(5),
  });

  const issues = issuesData?.data || [];
  const analytics = analyticsData?.data;

  const openCount = analytics?.statusBreakdown?.find((s) => s._id === 'open')?.count || 0;
  const resolvedCount = analytics?.statusBreakdown?.find((s) => s._id === 'resolved')?.count || 0;
  const inProgressCount = analytics?.statusBreakdown?.find((s) => s._id === 'in_progress')?.count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Level {user?.level || 1} · {user?.points || 0} points · {user?.issuesReported || 0} issues reported
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => window.location.href = '/report'}>
          Report Issue
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Open Issues" value={openCount} icon="🔴" color="bg-blue-500/15" delta={3} />
        <StatCard label="In Progress" value={inProgressCount} icon="🟡" color="bg-yellow-500/15" />
        <StatCard label="Resolved" value={resolvedCount} icon="✅" color="bg-green-500/15" delta={12} />
        <StatCard label="Your Points" value={user?.points || 0} icon="⚡" color="bg-primary-500/15" delta={user?.points > 0 ? 10 : 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame size={18} className="text-accent-400" /> Recent Issues
              </h2>
              <Link to="/map">
                <Button size="sm" variant="ghost" iconRight={<ArrowUpRight size={14} />}>View all</Button>
              </Link>
            </div>
            {issuesLoading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} className="mb-3" />)
              : issues.slice(0, 8).map((issue) => <IssueRow key={issue._id} issue={issue} />)
            }
          </Card>
        </div>

        {/* Leaderboard + Category breakdown */}
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Star size={18} className="text-warning-400" /> Leaderboard
            </h2>
            <div className="space-y-3">
              {(leaderboardData?.data?.users || []).map((u, i) => (
                <Link key={u._id} to={`/profile?id=${u._id}`}>
                  <div className="flex items-center gap-3 hover:bg-white/3 rounded-xl p-1.5 -mx-1.5 transition-colors">
                    <span className={`w-5 text-center text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {i + 1}
                    </span>
                    <img src={u.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${u.name}`}
                      alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.points} pts · Lv.{u.level}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary-400" /> Top Categories
            </h2>
            <div className="space-y-2.5">
              {(analytics?.categoryBreakdown || []).slice(0, 5).map((cat) => (
                <div key={cat._id} className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[cat._id]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 capitalize">{cat._id}</span>
                      <span className="text-slate-400">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (cat.count / (analytics?.categoryBreakdown?.[0]?.count || 1)) * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
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
