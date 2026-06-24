import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Category icon map
export const CATEGORY_ICONS = {
  roads: '🚗',
  water: '💧',
  electricity: '⚡',
  sanitation: '🗑️',
  parks: '🌳',
  safety: '🚨',
  noise: '🔊',
  other: '📌',
};

export const CATEGORY_COLORS = {
  roads: 'cat-roads',
  water: 'cat-water',
  electricity: 'cat-electricity',
  sanitation: 'cat-sanitation',
  parks: 'cat-parks',
  safety: 'cat-safety',
  noise: 'cat-noise',
  other: 'cat-other',
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
};

export const SEVERITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'], [1, 'second'],
  ];
  for (const [secs, unit] of intervals) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${unit}${val > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function truncate(str, n = 100) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}
