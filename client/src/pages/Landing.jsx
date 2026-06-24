import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Users, CheckCircle, Zap, Mic, Camera, Map } from 'lucide-react';
import Button from '@components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { issuesApi } from '@api/issues.api';

const FEATURES = [
  { icon: <MapPin size={24} />, title: 'Real-Time Map', desc: 'See issues near you on an interactive live map with clustering and heatmaps.' },
  { icon: <Mic size={24} />, title: 'Voice Reporting', desc: 'Report issues hands-free using built-in voice recognition in multiple languages.' },
  { icon: <Camera size={24} />, title: 'AR Camera', desc: 'Overlay AR guides to precisely document and photograph community problems.' },
  { icon: <Zap size={24} />, title: 'Instant Updates', desc: 'Get real-time notifications when your reported issues are addressed or resolved.' },
  { icon: <Users size={24} />, title: 'Community Votes', desc: 'Upvote critical issues to escalate them automatically to the right authority.' },
  { icon: <CheckCircle size={24} />, title: 'Track Progress', desc: 'Follow the full lifecycle of every issue from reporting to resolution.' },
];

const STATS = [
  { value: '12K+', label: 'Issues Resolved' },
  { value: '48K+', label: 'Active Citizens' },
  { value: '320+', label: 'Cities Covered' },
  { value: '94%', label: 'Satisfaction Rate' },
];

// Particle Canvas
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function Landing() {
  const navigate = useNavigate();

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => issuesApi.getAnalytics({}),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-hero-gradient overflow-hidden">
        <ParticleCanvas />

        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary-300 font-medium mb-8 border border-primary-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              Now live in 320+ cities across India
            </motion.div>

            <h1 className="font-display text-5xl sm:text-7xl font-black leading-[1.1] mb-6">
              <span className="text-white">Your City,</span>
              <br />
              <span className="gradient-text">Your Voice.</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Report potholes, broken streetlights, water leaks and 50+ other issues.
              Watch them get resolved in real-time with your community.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="xl"
                onClick={() => navigate('/report')}
                icon={<MapPin size={20} />}
                iconRight={<ArrowRight size={20} />}
                className="shadow-glow-lg"
              >
                Report an Issue
              </Button>
              <Button
                size="xl"
                variant="secondary"
                onClick={() => navigate('/map')}
                icon={<Map size={20} />}
              >
                View Live Map
              </Button>
            </div>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card text-center py-5"
              >
                <p className="text-3xl font-display font-black gradient-text">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
            <div className="w-1 h-3 bg-primary-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Everything you need</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A complete platform designed for citizens and local authorities to collaborate effectively.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card group hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-500/30 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card text-center py-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of citizens already transforming their communities. It's free.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={18} />}>
                Get Started — it's free
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/map')}>
                Explore the map
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© 2025 Community Hero. Built for the citizens, by the citizens.</p>
      </footer>
    </div>
  );
}
