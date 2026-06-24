import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment, Box, Text3D, Center, Float } from '@react-three/drei';
import { MapPin, Camera, Mic, Upload, Award, Zap, TrendingUp, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- UTILS ---

const MagneticButton = ({ children, onClick, className = '' }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`relative px-8 py-4 rounded-full font-bold overflow-hidden holographic-shine group ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
};

const Typewriter = ({ text, delay = 0 }) => {
  const words = text.split(' ');
  return (
    <span className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.1, type: 'spring' }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const AnimatedCounter = ({ from, to }) => {
  const nodeRef = useRef();
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
    let startTimestamp = null;
    const duration = 2000;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(ease * (to - from) + from);
      node.textContent = currentCount.toLocaleString();
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [from, to]);

  return <span ref={nodeRef}>{from}</span>;
};

// --- 3D SCENES ---

const HotspotSpike = ({ position, color }) => {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.05, 0.4, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const Globe = () => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={ref}>
      <Sphere args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#0A0A0F"
          emissive="#6C63FF"
          emissiveIntensity={0.2}
          wireframe={true}
          distort={0.2}
          speed={2}
          roughness={0.2}
          metalness={1}
        />
      </Sphere>
      {/* Fake hotspots */}
      <HotspotSpike position={[1.5, 1, 1]} color="#FF6B6B" />
      <HotspotSpike position={[-1.2, -1.2, 1.2]} color="#00D4FF" />
      <HotspotSpike position={[0, 1.8, -1]} color="#00FF88" />
      <HotspotSpike position={[1.8, -0.5, -0.5]} color="#FF6B6B" />
    </group>
  );
};

const Bar3D = ({ position, height, color, delay }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const targetScale = Math.max(0.1, Math.sin(state.clock.elapsedTime * 2 + delay) * height + height/2);
    ref.current.scale.y = targetScale;
    ref.current.position.y = targetScale / 2;
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[0.4, 1, 0.4]} />
      <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
};

const ChartScene = () => {
  return (
    <group position={[-1, -1, 0]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Bar3D position={[0, 0, 0]} height={1.5} color="#FF6B6B" delay={0} />
      <Bar3D position={[0.8, 0, 0]} height={2.5} color="#00D4FF" delay={0.2} />
      <Bar3D position={[1.6, 0, 0]} height={1.8} color="#6C63FF" delay={0.4} />
      <Bar3D position={[2.4, 0, 0]} height={3.2} color="#00FF88" delay={0.6} />
    </group>
  );
};

// --- SECTIONS ---

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Animated Particles background simulation (CSS/Framer) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary-500 rounded-full shadow-[0_0_10px_#00D4FF]"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{ 
              y: -100,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#6C63FF" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00D4FF" />
          <Globe />
          <Suspense fallback={null}>
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm font-medium text-primary-100">Live: <AnimatedCounter from={0} to={1432} /> issues resolved today</span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight leading-tight mb-6">
          <Typewriter text="Your City." delay={0} />
          <Typewriter text="Your Voice." delay={0.4} />
          <span className="gradient-text drop-shadow-[0_0_30px_rgba(108,99,255,0.5)]">
            <Typewriter text="Your Power." delay={0.8} />
          </span>
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xl text-slate-300 max-w-2xl mb-10"
        >
          The next-generation hyperlocal platform mapping community issues in real-time. Report, track, and witness your impact.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <MagneticButton onClick={() => navigate('/report')} className="bg-primary-500 text-white shadow-[0_0_30px_rgba(108,99,255,0.4)]">
            <Camera size={20} /> Report Issue Now
          </MagneticButton>
          <MagneticButton onClick={() => navigate('/map')} className="glass border-white/20 text-white hover:bg-white/10">
            View Live Map
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};

const ReportingInterface = () => {
  const [step, setStep] = useState(1);
  const [severity, setSeverity] = useState(0);

  return (
    <section className="py-32 px-4 bg-dark-900 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Interactive Demo */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, rotateY: 20, x: -50 }}
            whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="glass-glow p-2 rounded-[2.5rem]"
          >
            <div className="bg-dark-800 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
              {/* Simulated Camera Feed */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-900 mb-6 group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80" alt="Pothole" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* AI Overlay Animation */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-[30%] left-[20%] w-[40%] h-[30%] border-2 border-accent-400 bg-accent-400/20 rounded-lg pointer-events-none"
                >
                  <div className="absolute -top-6 left-0 bg-accent-400 text-white text-xs px-2 py-0.5 rounded-t-md font-mono">
                    Pothole: 94%
                  </div>
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-accent-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-accent-400" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-accent-400" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-accent-400" />
                </motion.div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(108,99,255,0.6)]">
                    <Upload size={24} />
                  </div>
                </div>
              </div>

              {/* Severity Speedometer */}
              <div className="mb-6 bg-dark-900/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-slate-400">AI Severity Analysis</span>
                  <span className="text-accent-400 font-mono font-bold text-lg">CRITICAL</span>
                </div>
                <div className="h-2 w-full bg-dark-600 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: "0%" }}
                    whileInView={{ width: "85%" }}
                    transition={{ delay: 1.5, duration: 1.5, type: "spring" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-success-400 via-warning-400 to-accent-400 rounded-full shadow-[0_0_10px_#FF6B6B]"
                  />
                </div>
              </div>

              {/* Voice Input */}
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30 relative">
                  <Mic size={20} />
                  <span className="absolute inset-0 rounded-xl border border-primary-400 animate-ping opacity-20" />
                </div>
                <div className="flex-1 glass rounded-xl px-4 py-3 flex items-center">
                  <Typewriter text="Massive pothole causing severe traffic delay on Main St..." delay={2} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Text Content */}
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-secondary-400 font-mono text-sm tracking-wider uppercase mb-2">
            <Zap size={16} /> Instant Reporting
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Report issues at the <br/><span className="gradient-text">speed of thought.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Snap a picture and let our advanced Vision AI do the rest. Auto-categorization, instant severity scoring, and precise geolocation pinning mean your report gets to authorities faster than ever.
          </p>

          {/* Animated Stepper */}
          <div className="mt-8 space-y-6">
            {[
              { icon: Camera, title: "1. Capture", desc: "AI instantly detects the problem type." },
              { icon: MapPin, title: "2. Pinpoint", desc: "Geolocation automatically attaches to your report." },
              { icon: Shield, title: "3. Resolve", desc: "Authorities are notified immediately." }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full glass border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0">
                  <s.icon size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{s.title}</h4>
                  <p className="text-slate-500">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DashboardBento = () => {
  return (
    <section className="py-24 px-4 bg-dark-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Command Center</h2>
          <p className="text-slate-400 text-lg">Real-time pulse of your city's civic health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[240px]">
          {/* Main Map Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-2 md:row-span-2 glass-card p-0 relative overflow-hidden"
          >
            <div className="absolute top-4 left-4 z-10 glass px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" /> Live Heatmap
            </div>
            {/* Fake Map Background */}
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
            
            {/* Pulsing Markers */}
            <div className="absolute top-[40%] left-[30%]">
              <div className="w-12 h-12 rounded-full bg-accent-400/20 flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 rounded-full bg-accent-400 shadow-[0_0_15px_#FF6B6B]" />
              </div>
            </div>
            <div className="absolute top-[60%] left-[60%]">
              <div className="w-16 h-16 rounded-full bg-warning-400/20 flex items-center justify-center animate-pulse delay-75">
                <div className="w-3 h-3 rounded-full bg-warning-400 shadow-[0_0_15px_#facc15]" />
              </div>
            </div>
          </motion.div>

          {/* 3D Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="glass-card p-6 relative"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-2">Category Breakdown</h3>
            <div className="absolute inset-0 pt-10">
              <Canvas camera={{ position: [0, 2, 5], fov: 40 }}>
                <ChartScene />
              </Canvas>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 bg-card-gradient border-primary-500/20"
          >
            <div className="flex items-center gap-2 mb-4 text-primary-400">
              <Zap size={16} /> <span className="text-sm font-bold uppercase tracking-wider">Gemini Insight</span>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed font-mono">
              <Typewriter text="> Anomaly detected: 42% spike in pothole reports in Downtown sector over the last 24 hours. Recommended immediate resource dispatch to 5th Avenue." delay={0.5} />
            </div>
          </motion.div>

          {/* Ticker */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="md:col-span-2 glass-card p-6 flex flex-col justify-center"
          >
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-success-400" /> Recently Resolved
            </h3>
            <div className="overflow-hidden relative w-full">
              <div className="flex gap-4 animate-[shimmer_20s_linear_infinite]">
                {['Streetlight fixed on Main St', 'Graffiti removed at Central Park', 'Water leak patched on 5th Ave', 'Pothole filled on Broadway'].map((text, i) => (
                  <div key={i} className="whitespace-nowrap px-4 py-2 glass rounded-full text-sm text-slate-300 border-success-500/20">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const LeaderboardPodium = () => {
  return (
    <section className="py-24 px-4 bg-hero-gradient relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-4xl font-black mb-16">Wall of Heroes</h2>

        <div className="flex flex-col md:flex-row items-end justify-center gap-6 h-[400px]">
          {/* 2nd Place */}
          <motion.div 
            initial={{ y: 200, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-full md:w-1/3 flex flex-col items-center"
          >
            <div className="glass-glow w-full p-4 rounded-t-3xl border-b-0 text-center h-[250px] relative mt-10">
              <img src="https://api.dicebear.com/8.x/notionists/svg?seed=Alex" className="w-20 h-20 rounded-full mx-auto -mt-10 bg-dark-800 border-4 border-secondary-400 shadow-[0_0_20px_#00D4FF]" />
              <h4 className="font-bold text-white mt-4">Alex M.</h4>
              <p className="text-secondary-400 text-sm font-mono mt-1">12.4k XP</p>
              <div className="absolute bottom-4 left-0 w-full px-6">
                <div className="h-1.5 w-full bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-400 w-[75%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ y: 250, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, type: "spring" }}
            className="w-full md:w-1/3 flex flex-col items-center"
          >
            <div className="absolute -top-10 text-warning-400 animate-bounce-subtle">
              <Award size={48} className="drop-shadow-[0_0_15px_#facc15]" />
            </div>
            <div className="glass-glow w-full p-4 rounded-t-3xl border-b-0 text-center h-[300px] border-warning-400/30 relative">
              <div className="absolute inset-0 holographic-shine rounded-t-3xl pointer-events-none mix-blend-color-dodge" />
              <img src="https://api.dicebear.com/8.x/notionists/svg?seed=Sarah" className="w-24 h-24 rounded-full mx-auto -mt-12 bg-dark-800 border-4 border-warning-400 shadow-[0_0_30px_#facc15]" />
              <h4 className="font-bold text-white mt-4 text-xl">Sarah T.</h4>
              <p className="text-warning-400 text-sm font-mono mt-1">15.8k XP</p>
              <div className="mt-4 flex justify-center gap-2">
                {/* 3D Flip Badges CSS simulated */}
                <div className="w-8 h-8 rounded bg-primary-500/20 border border-primary-400/50 flex items-center justify-center text-xs hover:rotate-[360deg] transition-transform duration-700 cursor-pointer">🛡️</div>
                <div className="w-8 h-8 rounded bg-accent-400/20 border border-accent-400/50 flex items-center justify-center text-xs hover:rotate-[360deg] transition-transform duration-700 cursor-pointer">📸</div>
              </div>
              <div className="absolute bottom-4 left-0 w-full px-6">
                <div className="h-1.5 w-full bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-warning-400 w-[92%] shadow-[0_0_10px_#facc15]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ y: 200, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: "spring" }}
            className="w-full md:w-1/3 flex flex-col items-center"
          >
            <div className="glass-glow w-full p-4 rounded-t-3xl border-b-0 text-center h-[220px] relative mt-16">
              <img src="https://api.dicebear.com/8.x/notionists/svg?seed=David" className="w-16 h-16 rounded-full mx-auto -mt-8 bg-dark-800 border-4 border-accent-400 shadow-[0_0_15px_#FF6B6B]" />
              <h4 className="font-bold text-white mt-4">David L.</h4>
              <p className="text-accent-400 text-sm font-mono mt-1">10.1k XP</p>
              <div className="absolute bottom-4 left-0 w-full px-6">
                <div className="h-1.5 w-full bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-400 w-[60%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function Showcase() {
  return (
    <main className="bg-dark-900 min-h-screen text-white overflow-x-hidden selection:bg-primary-500/30">
      <HeroSection />
      <ReportingInterface />
      <DashboardBento />
      <LeaderboardPodium />
    </main>
  );
}
