import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { ShieldAlert, Activity, CheckCircle, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { issuesApi } from '@api/issues.api';
import { useSocket } from '@context/SocketContext';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import { CATEGORY_ICONS, STATUS_LABELS, timeAgo, cn } from '@utils/helpers';

export default function WarRoom() {
  const socket = useSocket();
  const [liveStats, setLiveStats] = useState({
    totalOpen: 0,
    totalResolved: 0,
    criticalIssues: 0,
    activeOfficers: 0
  });
  
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [officers, setOfficers] = useState(new Map());

  const { data: initialData } = useQuery({
    queryKey: ['war_room_initial'],
    queryFn: () => issuesApi.getAll({ limit: 100 })
  });

  // Calculate initial stats
  useEffect(() => {
    if (initialData?.data) {
      const issues = initialData.data;
      const open = issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
      const resolved = issues.filter(i => i.status === 'resolved').length;
      const critical = issues.filter(i => i.severityScore >= 80 || i.severity === 'critical').length;
      
      setLiveStats(prev => ({ ...prev, totalOpen: open, totalResolved: resolved, criticalIssues: critical }));
    }
  }, [initialData]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    
    // Join admin/authority role rooms for War Room updates
    // (Handled implicitly on backend connection by role)

    const handleNewIssue = (issue) => {
      setLiveStats(prev => ({ ...prev, totalOpen: prev.totalOpen + 1 }));
      if (issue.severityScore >= 80 || issue.severity === 'critical') {
        setLiveStats(prev => ({ ...prev, criticalIssues: prev.criticalIssues + 1 }));
      }
    };

    const handleIssueStatus = (issue) => {
      if (issue.status === 'resolved') {
        setLiveStats(prev => ({ 
          ...prev, 
          totalOpen: Math.max(0, prev.totalOpen - 1),
          totalResolved: prev.totalResolved + 1 
        }));
        
        // Fire celebration!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4ade80', '#22c55e', '#16a34a']
        });
      }
    };

    const handleCriticalAlert = (issue) => {
      setCriticalAlerts(prev => [issue, ...prev].slice(0, 5)); // Keep top 5
      // Optional: play sound
      try {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(() => {}); // ignore autoplay block
      } catch (e) { /* ignore autoplay block */ }
    };

    const handleOfficerLocation = ({ userId, location }) => {
      setOfficers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { ...location, lastUpdated: new Date() });
        return newMap;
      });
      setLiveStats(prev => ({ ...prev, activeOfficers: officers.size + 1 }));
    };

    socket.on('issue:created', handleNewIssue);
    socket.on('issue:status-changed', handleIssueStatus);
    socket.on('issue:critical_alert', handleCriticalAlert);
    socket.on('officer:location_updated', handleOfficerLocation);

    return () => {
      socket.off('issue:created', handleNewIssue);
      socket.off('issue:status-changed', handleIssueStatus);
      socket.off('issue:critical_alert', handleCriticalAlert);
      socket.off('officer:location_updated', handleOfficerLocation);
    };
  }, [socket, officers.size]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-dark-950 text-white font-sans selection:bg-primary-500/30">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert size={32} className="text-primary-400" />
            City War Room
          </h1>
          <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
            </span>
            Live Updates Enabled
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Activity />} title="Active Issues" value={liveStats.totalOpen} color="text-primary-400" bg="bg-primary-500/10" />
        <StatCard icon={<CheckCircle />} title="Issues Resolved" value={liveStats.totalResolved} color="text-success-400" bg="bg-success-500/10" />
        <StatCard icon={<AlertTriangle />} title="Critical Alerts" value={liveStats.criticalIssues} color="text-danger-400" bg="bg-danger-500/10" highlight={liveStats.criticalIssues > 0} />
        <StatCard icon={<MapPin />} title="Active Officers" value={liveStats.activeOfficers} color="text-accent-400" bg="bg-accent-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Feed */}
        <div className="lg:col-span-1">
          <Card className="p-5 h-full border border-danger-500/20 bg-danger-500/5 shadow-glow-sm">
            <h3 className="text-lg font-bold text-danger-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="animate-pulse" /> Breaking Alerts
            </h3>
            
            <AnimatePresence>
              {criticalAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No critical alerts right now.</p>
              ) : (
                <div className="space-y-4">
                  {criticalAlerts.map(alert => (
                    <motion.div 
                      key={alert._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-dark-900 border border-danger-500/30 p-4 rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl">{CATEGORY_ICONS[alert.category]}</span>
                        <Badge variant="danger" size="xs">Critical</Badge>
                      </div>
                      <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <MapPin size={12} /> {alert.location?.city || 'Unknown'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Placeholder for Big Map */}
        <div className="lg:col-span-2">
           <Card className="p-0 h-[600px] overflow-hidden relative border border-white/10 flex items-center justify-center bg-dark-900 shadow-glass">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-dark-900 to-dark-900"></div>
             
             {/* Mock radar sweep animation */}
             <div className="w-[500px] h-[500px] border border-primary-500/20 rounded-full absolute flex items-center justify-center">
               <div className="w-[300px] h-[300px] border border-primary-500/20 rounded-full"></div>
               <div className="w-[100px] h-[100px] border border-primary-500/20 rounded-full absolute"></div>
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="absolute inset-0 w-1/2 h-full origin-right border-r-2 border-primary-400/50 bg-gradient-to-l from-primary-500/10 to-transparent"
               ></motion.div>
             </div>

             <div className="z-10 text-center">
                <MapPin size={48} className="text-primary-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white">City Command Overview</h3>
                <p className="text-slate-400">Monitoring grid active.</p>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, bg, highlight }) {
  return (
    <Card className={cn('p-6 relative overflow-hidden', highlight ? 'border-danger-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5')}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <motion.h3 
            key={value} 
            initial={{ scale: 1.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="text-4xl font-black text-white tracking-tight"
          >
            {value}
          </motion.h3>
        </div>
        <div className={cn('p-3 rounded-2xl', bg, color)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
