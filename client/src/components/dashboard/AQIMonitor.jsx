import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Eye, Thermometer, Activity } from 'lucide-react';

const AQI_LEVELS = [
  { max: 50,  label: 'Good',           color: 'text-green-400',  bg: 'bg-green-400',  advice: 'Air quality is satisfactory.' },
  { max: 100, label: 'Satisfactory',   color: 'text-lime-400',   bg: 'bg-lime-400',   advice: 'Acceptable for most people.' },
  { max: 200, label: 'Moderate',       color: 'text-yellow-400', bg: 'bg-yellow-400', advice: 'Sensitive groups should reduce outdoor activity.' },
  { max: 300, label: 'Poor',           color: 'text-orange-400', bg: 'bg-orange-400', advice: 'Everyone may experience health effects.' },
  { max: 400, label: 'Very Poor',      color: 'text-red-400',    bg: 'bg-red-400',    advice: 'Avoid prolonged outdoor activity.' },
  { max: 500, label: 'Severe',         color: 'text-purple-400', bg: 'bg-purple-400', advice: 'Health emergency! Stay indoors.' },
];

function getAQILevel(aqi) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

async function fetchAQI() {
  try {
    // Production: fetch from https://api.data.gov.in CPCB AQI for Rourkela
    const res = await fetch(`${getApiUrl()}/environment/aqi`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Rourkela mock — RSP is a steel plant city, AQI typically 80-180
    const baseAQI = 85 + Math.floor(Math.random() * 80);
    return {
      aqi: baseAQI,
      station: 'Rourkela (CPCB)',
      pm25: (baseAQI * 0.4).toFixed(1),
      pm10: (baseAQI * 0.6).toFixed(1),
      no2: (12 + Math.random() * 15).toFixed(1),
      so2: (8 + Math.random() * 20).toFixed(1),
      co: (0.8 + Math.random() * 0.6).toFixed(2),
      temperature: (28 + Math.random() * 5).toFixed(1),
      humidity: (60 + Math.random() * 20).toFixed(0),
      updatedAt: new Date().toISOString(),
      source: 'simulated'
    };
  }
}

export default function AQIMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAQI().then(d => { setData(d); setLoading(false); });
    const interval = setInterval(() => fetchAQI().then(setData), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 animate-pulse">
      <div className="h-5 bg-slate-700 rounded w-1/3 mb-3" />
      <div className="h-20 bg-slate-700 rounded" />
    </div>
  );

  const level = getAQILevel(data.aqi);
  const pct = Math.min((data.aqi / 500) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className={`w-5 h-5 ${level.color}`} />
          <h3 className="font-bold text-white">AQI Monitor</h3>
          <span className="text-xs text-slate-400">Rourkela</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${level.color} bg-slate-700`}>
          {level.label}
        </span>
      </div>

      {/* AQI Dial */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 32 * pct / 100} ${2 * Math.PI * 32 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${level.bg}`}
              style={{ stroke: 'currentColor' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${level.color}`}>{data.aqi}</span>
            <span className="text-slate-500 text-xs">AQI</span>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold">{level.label}</p>
          <p className="text-slate-400 text-xs mt-1">{level.advice}</p>
          <p className="text-slate-500 text-xs mt-1">📍 {data.station}</p>
        </div>
      </div>

      {/* Pollutant Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { key: 'pm25', label: 'PM2.5',  unit: 'µg/m³', icon: Activity },
          { key: 'pm10', label: 'PM10',   unit: 'µg/m³', icon: Activity },
          { key: 'no2',  label: 'NO₂',    unit: 'µg/m³', icon: Eye },
          { key: 'so2',  label: 'SO₂',    unit: 'µg/m³', icon: Eye },
          { key: 'co',   label: 'CO',     unit: 'mg/m³', icon: Wind },
        ].map(({ key, label, unit }) => (
          <div key={key} className="bg-slate-900/50 rounded-xl p-2 text-center">
            <div className="text-slate-400 text-xs">{label}</div>
            <div className="text-white font-bold text-sm">{data[key]}</div>
            <div className="text-slate-600 text-xs">{unit}</div>
          </div>
        ))}
        <div className="bg-slate-900/50 rounded-xl p-2 text-center">
          <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3" /> Temp
          </div>
          <div className="text-white font-bold text-sm">{data.temperature}°C</div>
          <div className="text-slate-600 text-xs">💧{data.humidity}%</div>
        </div>
      </div>

      {/* RSP Note */}
      <div className="text-xs text-slate-500 bg-slate-900/40 rounded-xl p-2 flex gap-1">
        <span>🏭</span>
        <span>Elevated readings typical near RSP Steel Plant. Report industrial pollution to OSPCB.</span>
      </div>
    </motion.div>
  );
}
