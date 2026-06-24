import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Camera, Edit3, Star, CheckCircle, MapPin,
  Zap, Trophy, BarChart2, Calendar, Award
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { usersApi } from '@api/users.api';
import { issuesApi } from '@api/issues.api';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import { Skeleton, SkeletonCard } from '@components/ui/Skeleton';
import { CATEGORY_ICONS, STATUS_LABELS, timeAgo, cn } from '@utils/helpers';
import toast from 'react-hot-toast';

const BADGE_ICONS = {
  'First Report': '🏆',
  'Problem Solver': '🔧',
  'Community Star': '⭐',
  'Eco Warrior': '🌱',
  'Safety Champion': '🛡️',
  'Active Citizen': '🏅',
};

function StatBlock({ label, value, icon }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-display font-bold gradient-text">{value ?? 0}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
  const avatarRef = useRef();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  });

  const { data: issuesData } = useQuery({
    queryKey: ['my-issues', user?._id],
    queryFn: () => issuesApi.getAll({ reporter: user?._id, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!user?._id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated!');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (formData) => usersApi.uploadAvatar(formData),
    onSuccess: (res) => {
      updateUser({ avatar: res.data.avatarUrl });
      toast.success('Avatar updated!');
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    avatarMutation.mutate(fd);
  };

  const profile = profileData?.data?.user || user;
  const recentIssues = issuesData?.data || [];

  const levelProgress = ((profile?.points || 0) % 100);
  const nextLevelPoints = 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <img
                src={profile?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${profile?.name}`}
                alt={profile?.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-500/30"
              />
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-colors shadow-glow-sm"
              >
                <Camera size={14} />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3 text-left">
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 glass rounded-xl text-sm text-white border border-white/10 focus:outline-none focus:border-primary-500/50"
                  placeholder="Your name"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 glass rounded-xl text-sm text-white border border-white/10 focus:outline-none focus:border-primary-500/50 resize-none"
                  placeholder="Bio (optional)"
                />
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 glass rounded-xl text-sm text-white border border-white/10 focus:outline-none focus:border-primary-500/50"
                  placeholder="Phone (optional)"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" loading={updateMutation.isPending}
                    onClick={() => updateMutation.mutate(formData)}>Save</Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl font-bold text-white">{profile?.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
                {profile?.bio && <p className="text-sm text-slate-300 mt-2">{profile.bio}</p>}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="primary">Lv.{profile?.level || 1}</Badge>
                  <Badge variant="default" className="capitalize">{profile?.role}</Badge>
                </div>
                <Button size="sm" variant="secondary" icon={<Edit3 size={14} />} className="mt-4 w-full"
                  onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </>
            )}
          </motion.div>

          {/* Level Progress */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white flex items-center gap-1.5">
                <Zap size={14} className="text-primary-400" /> Level {profile?.level || 1}
              </span>
              <span className="text-xs text-slate-400">{profile?.points || 0} pts total</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{levelProgress}/{nextLevelPoints} pts to Level {(profile?.level || 1) + 1}</p>
          </Card>

          {/* Stats */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 size={14} className="text-primary-400" /> Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <StatBlock label="Reported" value={profile?.issuesReported} />
              <StatBlock label="Resolved" value={profile?.issuesResolved} />
              <StatBlock label="Points" value={profile?.points} />
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Badges */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy size={14} className="text-warning-400" /> Badges Earned
            </h3>
            {profile?.badges?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge) => (
                  <motion.div
                    key={badge}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-warning-500/20 bg-warning-500/5"
                  >
                    <span>{BADGE_ICONS[badge] || '🏅'}</span>
                    <span className="text-xs text-warning-300 font-medium">{badge}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Award size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No badges yet. Report your first issue to earn one!</p>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-primary-400" /> Recent Activity
            </h3>
            {recentIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">You haven't reported any issues yet.</p>
                <Link to="/report">
                  <Button size="sm" className="mt-3">Report your first issue</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentIssues.map((issue) => (
                  <Link key={issue._id} to={`/issue/${issue._id}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 group"
                    >
                      <span className="text-xl shrink-0">{CATEGORY_ICONS[issue.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white group-hover:text-primary-300 transition-colors truncate">{issue.title}</p>
                        <p className="text-xs text-slate-500">{timeAgo(issue.createdAt)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full status-${issue.status} shrink-0`}>
                        {STATUS_LABELS[issue.status]}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Notification Preferences */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Get updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-white">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = {
                        notifications: {
                          ...profile?.notifications,
                          [pref.key]: !profile?.notifications?.[pref.key],
                        },
                      };
                      updateMutation.mutate(updated);
                    }}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-all duration-300',
                      profile?.notifications?.[pref.key] ? 'bg-primary-500' : 'bg-white/10'
                    )}
                  >
                    <motion.div
                      animate={{ x: profile?.notifications?.[pref.key] ? 20 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
