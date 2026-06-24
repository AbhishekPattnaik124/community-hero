/**
 * constants.js
 * Rourkela-specific constants for Community Hero frontend
 */

export const CITY_CONFIG = {
  name: 'Rourkela',
  state: 'Odisha',
  country: 'India',
  mapCenter: [84.8536, 22.2604], // [lng, lat] for Mapbox
  mapCenterLeaflet: [22.2604, 84.8536], // [lat, lng] for Leaflet
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
};

export const AUTHORITIES = {
  RMC:      { label: 'Rourkela Municipal Corporation', color: '#3b82f6', short: 'RMC' },
  SAIL_RSP: { label: 'SAIL RSP Township',              color: '#f59e0b', short: 'SAIL' },
  NHAI:     { label: 'National Highway Authority',     color: '#8b5cf6', short: 'NHAI' },
  OSPCB:    { label: 'Odisha Pollution Control Board', color: '#10b981', short: 'OSPCB' },
  OSDMA:    { label: 'Odisha Disaster Management',     color: '#ef4444', short: 'OSDMA' },
};

export const ISSUE_CATEGORIES = [
  { id: 'pothole',      label: 'Pothole',              icon: '🕳️',  color: '#ef4444' },
  { id: 'waterlogging', label: 'Waterlogging',         icon: '💧',  color: '#3b82f6' },
  { id: 'streetlight',  label: 'Streetlight',          icon: '💡',  color: '#f59e0b' },
  { id: 'garbage',      label: 'Garbage Dump',         icon: '🗑️',  color: '#10b981' },
  { id: 'pollution',    label: 'Industrial Pollution', icon: '🏭',  color: '#6b7280' },
  { id: 'construction', label: 'Road Damage',          icon: '🚧',  color: '#8b5cf6' },
  { id: 'water_supply', label: 'Water Supply',         icon: '🚰',  color: '#06b6d4' },
  { id: 'sewer',        label: 'Sewer / Drain',        icon: '🪣',  color: '#a16207' },
  { id: 'heritage',     label: 'Heritage Issue',       icon: '🏛️',  color: '#dc2626' },
  { id: 'other',        label: 'Other',                icon: '📋',  color: '#94a3b8' },
];

export const SEVERITY_CONFIG = {
  1: { label: 'Very Low',  color: '#94a3b8', description: 'Minor inconvenience' },
  2: { label: 'Low',       color: '#22c55e', description: 'Can wait a few weeks' },
  3: { label: 'Medium',    color: '#f59e0b', description: 'Needs attention soon' },
  4: { label: 'High',      color: '#ef4444', description: 'Urgent — affecting many people' },
  5: { label: 'Critical',  color: '#dc2626', description: 'Safety risk — immediate action needed' },
};

export const STATUS_CONFIG = {
  reported:    { label: 'Reported',    color: '#94a3b8', step: 1 },
  verified:    { label: 'Verified',    color: '#3b82f6', step: 2 },
  assigned:    { label: 'Assigned',    color: '#f59e0b', step: 3 },
  in_progress: { label: 'In Progress', color: '#8b5cf6', step: 4 },
  resolved:    { label: 'Resolved',    color: '#10b981', step: 5 },
  rejected:    { label: 'Rejected',    color: '#ef4444', step: -1 },
};

export const POINTS_CONFIG = {
  report_issue: 10,
  verify_issue: 5,
  upvote_given: 1,
  issue_resolved: 25,
  streak_bonus: 5,
};

export const BADGE_CONFIG = {
  first_report:    { label: 'First Report',    icon: '📝', threshold: 1  },
  verified_hero:   { label: 'Verified Hero',   icon: '✅', threshold: 5  },
  top_reporter:    { label: 'Top Reporter',    icon: '🏆', threshold: 10 },
  flood_watcher:   { label: 'Flood Watcher',   icon: '🌊', threshold: 3  },
  streak_7:        { label: '7-Day Streak',    icon: '🔥', threshold: 7  },
  community_voice: { label: 'Community Voice', icon: '📢', threshold: 20 },
};

// Rourkela wards summary (use rourkelaData.js on backend for full data)
export const WARD_COUNT = 40;
export const WARD_RANGE = [1, 40];

export const ROURKELA_FLOOD_ZONES = [
  { name: 'Bondamunda',  lat: 22.2134, lng: 84.8412, risk: 'HIGH'   },
  { name: 'Jhirpani',    lat: 22.1956, lng: 84.8234, risk: 'HIGH'   },
  { name: 'Panposh',     lat: 22.2045, lng: 84.8156, risk: 'MEDIUM' },
  { name: 'Koelnagar',   lat: 22.2445, lng: 84.8678, risk: 'MEDIUM' },
];

export const EMERGENCY_CONTACTS = {
  rmc:    { label: 'RMC Helpline',  phone: '0661-2400825' },
  osdma:  { label: 'OSDMA',        phone: '0674-2534177' },
  police: { label: 'Police',        phone: '100'         },
  fire:   { label: 'Fire',          phone: '101'         },
  ambulance: { label: 'Ambulance',  phone: '108'         },
};
