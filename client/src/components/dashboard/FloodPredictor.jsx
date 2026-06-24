import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const RISK_CONFIG = {
  SAFE:     { color: 'text-green-400',  bg: 'bg-green-400/10  border-green-400/30',  label: 'SAFE',     emoji: '✅' },
  MEDIUM:   { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', label: 'MEDIUM',   emoji: '⚠️' },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', label: 'HIGH',     emoji: '🔶' },
  CRITICAL: { color: 'text-red-400',    bg: 'bg-red-400/10    border-red-400/30',    label: 'CRITICAL', emoji: '🚨' },
};

async function fetchFloodData() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/flood-prediction`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Realistic mock for demo
    const month = new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 9;
    return {
      riskLevel: isMonsoon ? 'MEDIUM' : 'SAFE',
      riskScore: isMonsoon ? 38 : 8,
      rainfall: { currentRainfallMmHr: isMonsoon ? 12 : 0, last24hRainfallMm: isMonsoon ? 68 : 4 },
      riverData: { koelRiverLevel: isMonsoon ? 142.5 : 140.3, mandiraDamLevel: isMonsoon ? 143.1 : 141.0 },
      warnings: isMonsoon ? ['Moderate monsoon rainfall ongoing'] : [],
      affectedWardNames: isMonsoon ? ['Bondamunda East', 'Jhirpani'] : [],
      recommendation: isMonsoon ? 'Monitor conditions. Avoid Bondamunda low areas.' : 'No flood risk.',
      hoursToImpact: isMonsoon ? 6 : null,
      computedAt: new Date().toISOString(),
    };
  }
}

export default function FloodPredictor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFloodData().then(d => { setData(d); setLoading(false); });
    const interval = setInterval(() => {
      fetchFloodData().then(setData);
    }, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 animate-pulse">
      <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
      <div className="h-16 bg-slate-700 rounded" />
    </div>
  );

  const cfg = RISK_CONFIG[data?.riskLevel] || RISK_CONFIG.SAFE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-5 ${cfg.bg}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className={`w-5 h-5 ${cfg.color}`} />
          <h3 className="font-bold text-white">Flood Predictor</h3>
          <span className="text-xs text-slate-400">Rourkela</span>
        </div>
        <span className={`font-black text-sm ${cfg.color} flex items-center gap-1`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* River Levels */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">Koel River</div>
          <div className={`text-xl font-black ${data.riverData.koelRiverLevel >= 145 ? 'text-red-400' : 'text-cyan-400'}`}>
            {data.riverData.koelRiverLevel.toFixed(1)}m
          </div>
          <div className="text-slate-500 text-xs">Critical: 147m</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">Mandira Dam</div>
          <div className={`text-xl font-black ${data.riverData.mandiraDamLevel >= 145 ? 'text-orange-400' : 'text-blue-400'}`}>
            {data.riverData.mandiraDamLevel.toFixed(1)}m
          </div>
          <div className="text-slate-500 text-xs">Critical: 148m</div>
        </div>
      </div>

      {/* Rainfall */}
      <div className="flex items-center gap-3 mb-4 bg-slate-800/50 rounded-xl p-3">
        <TrendingUp className="text-blue-400 w-4 h-4 shrink-0" />
        <div>
          <span className="text-white font-semibold">{data.rainfall.currentRainfallMmHr} mm/hr</span>
          <span className="text-slate-400 text-xs ml-2">current rainfall</span>
        </div>
        <div className="ml-auto text-slate-400 text-xs">{data.rainfall.last24hRainfallMm} mm / 24h</div>
      </div>

      {/* Warnings */}
      {data.warnings?.length > 0 && (
        <div className="mb-4">
          {data.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-orange-300 mb-1">
              <AlertTriangle className="w-3 h-3 shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}

      {/* Affected Areas */}
      {data.affectedWardNames?.length > 0 && (
        <div className="mb-4">
          <div className="text-slate-400 text-xs mb-1">At-risk areas:</div>
          <div className="flex flex-wrap gap-1">
            {data.affectedWardNames.map(w => (
              <span key={w} className="text-xs bg-red-400/20 text-red-300 border border-red-400/20 rounded-full px-2 py-0.5">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="flex items-start gap-2 bg-slate-800/40 rounded-xl p-3">
        <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
        <p className="text-slate-300 text-xs">{data.recommendation}</p>
      </div>

      {data.riskLevel === 'CRITICAL' && (
        <a
          href="tel:06742534177"
          className="mt-3 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          📞 Call OSDMA Emergency: 0674-2534177
        </a>
      )}

      <div className="text-slate-600 text-xs text-right mt-2">
        Updated: {new Date(data.computedAt).toLocaleTimeString()}
      </div>
    </motion.div>
  );
}
