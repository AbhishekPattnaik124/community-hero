import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BADGE_META = {
  first_report:    { label: 'First Report',    icon: '📝', color: 'bg-blue-100 text-blue-700' },
  verified_hero:   { label: 'Verified Hero',   icon: '✅', color: 'bg-green-100 text-green-700' },
  top_reporter:    { label: 'Top Reporter',    icon: '🏆', color: 'bg-yellow-100 text-yellow-700' },
  flood_watcher:   { label: 'Flood Watcher',  icon: '🌊', color: 'bg-cyan-100 text-cyan-700' },
  streak_7:        { label: '7-Day Streak',    icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  community_voice: { label: 'Community Voice', icon: '📢', color: 'bg-purple-100 text-purple-700' },
};

// Mock data – replace with real API when backend is ready
const MOCK_LEADERS = [
  { rank: 1,  name: 'Sunita Devi',     ward: 28, points: 1240, badge: 'top_reporter',    avatar: '👩', issues: 42 },
  { rank: 2,  name: 'Priya Patel',     ward: 12, points: 980,  badge: 'verified_hero',   avatar: '👩‍💼', issues: 35 },
  { rank: 3,  name: 'Rajesh Kumar',    ward: 5,  points: 720,  badge: 'flood_watcher',   avatar: '👨', issues: 28 },
  { rank: 4,  name: 'Amit Singh',      ward: 20, points: 640,  badge: 'streak_7',        avatar: '👨‍💻', issues: 22 },
  { rank: 5,  name: 'Ravi Sharma',     ward: 35, points: 510,  badge: 'community_voice', avatar: '👨‍🦱', issues: 19 },
  { rank: 6,  name: 'Meera Kumari',    ward: 8,  points: 480,  badge: 'first_report',    avatar: '👩‍🦰', issues: 17 },
  { rank: 7,  name: 'Suresh Mahato',   ward: 15, points: 420,  badge: 'verified_hero',   avatar: '🧑', issues: 16 },
  { rank: 8,  name: 'Anita Senapati',  ward: 3,  points: 380,  badge: 'flood_watcher',   avatar: '👩‍🦳', issues: 14 },
  { rank: 9,  name: 'Bikash Pradhan',  ward: 22, points: 310,  badge: 'streak_7',        avatar: '👨‍🦳', issues: 12 },
  { rank: 10, name: 'Deepa Sahoo',     ward: 39, points: 280,  badge: 'first_report',    avatar: '🧑‍🦱', issues: 10 },
];

const PERIOD_LABELS = ['Weekly', 'Monthly', 'All-Time'];

// Animated podium bar heights
const PODIUM = [
  { rank: 1, height: 'h-48', label: '#1', medal: '🥇', glowClass: 'shadow-yellow-400/50' },
  { rank: 2, height: 'h-36', label: '#2', medal: '🥈', glowClass: 'shadow-slate-400/50' },
  { rank: 3, height: 'h-28', label: '#3', medal: '🥉', glowClass: 'shadow-orange-400/50' },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState(2);
  const [leaders, setLeaders] = useState(MOCK_LEADERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/users/leaderboard?period=${PERIOD_LABELS[period].toLowerCase()}`);
        if (res.data?.length) setLeaders(res.data);
      } catch {
        setLeaders(MOCK_LEADERS); // graceful fallback
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, [period]);

  const top3 = leaders.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Trophy className="text-yellow-400 w-16 h-16" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
            Community Leaderboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Rourkela's top civic heroes 🏙️</p>
        </motion.div>

        {/* Period Toggle */}
        <div className="flex justify-center gap-2 mb-12">
          {PERIOD_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setPeriod(i)}
              className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${
                period === i
                  ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Podium — Top 3 */}
        <div className="flex items-end justify-center gap-4 mb-16 px-4">
          {/* Reorder for display: 2nd | 1st | 3rd */}
          {[1, 0, 2].map((idx) => {
            const user = top3[idx];
            const pod = PODIUM[idx];
            if (!user) return null;
            return (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center"
              >
                {/* Avatar + Name */}
                <div className="text-center mb-3">
                  <div className="text-4xl mb-1">{user.avatar}</div>
                  <div className="font-bold text-sm">{user.name.split(' ')[0]}</div>
                  <div className="text-slate-400 text-xs">Ward {user.ward}</div>
                  <div className="text-yellow-400 font-black text-lg">{user.points.toLocaleString()} pts</div>
                </div>
                {/* Bar */}
                <div
                  className={`w-24 ${pod.height} rounded-t-2xl flex flex-col items-center justify-end pb-4 shadow-xl ${pod.glowClass} ${
                    idx === 0 ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                    : idx === 1 ? 'bg-gradient-to-t from-slate-500 to-slate-300'
                    : 'bg-gradient-to-t from-orange-700 to-orange-500'
                  }`}
                >
                  <span className="text-2xl">{pod.medal}</span>
                  <span className="font-black text-sm">{pod.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm"
        >
          <div className="p-5 border-b border-slate-700 flex items-center gap-2">
            <TrendingUp className="text-yellow-400 w-5 h-5" />
            <h2 className="font-bold text-lg">Full Rankings</h2>
          </div>

          <div className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {leaders.map((user, i) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-700/40 transition-colors ${
                    i < 3 ? 'bg-yellow-400/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 text-center font-black text-lg ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-500' : 'text-slate-500'
                  }`}>
                    {i < 3 ? PODIUM[i].medal : `#${user.rank}`}
                  </div>

                  {/* Avatar */}
                  <span className="text-3xl">{user.avatar}</span>

                  {/* Name + Ward */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{user.name}</div>
                    <div className="text-slate-400 text-xs flex items-center gap-1">
                      <span>Ward {user.ward}</span>
                      <span>·</span>
                      <span>{user.issues} issues reported</span>
                    </div>
                  </div>

                  {/* Badge */}
                  {BADGE_META[user.badge] && (
                    <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${BADGE_META[user.badge].color}`}>
                      {BADGE_META[user.badge].icon} {BADGE_META[user.badge].label}
                    </span>
                  )}

                  {/* Points */}
                  <div className="text-right">
                    <div className="font-black text-yellow-400">{user.points.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs">pts</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <p className="text-slate-400 mb-4">Every issue you report earns you <span className="text-yellow-400 font-bold">10 points</span> 🎯</p>
          <a
            href="/report"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-black rounded-2xl shadow-lg shadow-orange-400/30 hover:scale-105 transition-transform"
          >
            <Award className="w-5 h-5" /> Report an Issue Now
          </a>
        </motion.div>

      </div>
    </div>
  );
}
