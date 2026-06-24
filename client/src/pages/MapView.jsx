import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '@context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Filter, Layers, MapPin, X, Plus, ZoomIn } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@store/mapStore';
import { issuesApi } from '@api/issues.api';
import { useGeolocation } from '@hooks/useGeolocation';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { CATEGORY_ICONS, STATUS_LABELS, timeAgo, cn } from '@utils/helpers';

// We use react-leaflet to render the map
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
}

const createCustomIcon = (category) => {
  return L.divIcon({
    className: 'custom-leaflet-icon bg-transparent border-0',
    html: `<div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-glass border border-white/20 bg-dark-800 hover:scale-125 transition-transform" style="transform: translate(-50%, -50%); margin-top: 16px; margin-left: 16px;">${CATEGORY_ICONS[category] || '📍'}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const CATEGORIES = ['roads', 'water', 'electricity', 'sanitation', 'parks', 'safety', 'noise', 'other'];
const STATUSES = ['open', 'in_progress', 'resolved', 'escalated'];

function IssuePopup({ issue, onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="glass-dark border border-white/10 rounded-2xl p-4 w-72 shadow-glass"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
          <div>
            <p className="text-sm font-semibold text-white line-clamp-2">{issue.title}</p>
            <p className="text-xs text-slate-400">{timeAgo(issue.createdAt)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0">
          <X size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full status-${issue.status}`}>
          {STATUS_LABELS[issue.status]}
        </span>
        <span className="text-xs text-slate-400">⭐ {issue.upvoteCount} upvotes</span>
      </div>
      <Button size="sm" className="w-full" onClick={() => navigate(`/issue/${issue._id}`)}>
        View Details
      </Button>
    </motion.div>
  );
}

function FilterPanel({ filters, onChange, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-30 glass-dark border border-white/10 rounded-2xl p-5 w-64 shadow-glass"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm">Filter Issues</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onChange({ category: filters.category === cat ? '' : cat })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  filters.category === cat
                    ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50'
                    : 'glass text-slate-400 hover:text-white border-transparent'
                )}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onChange({ status: filters.status === s ? '' : s })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                  filters.status === s
                    ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50'
                    : 'glass text-slate-400 hover:text-white'
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


export default function MapView() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [liveIssues, setLiveIssues] = useState([]);
  const { filters, setFilters } = useMapStore();
  const { location, getLocation } = useGeolocation();
  const navigate = useNavigate();
  const socket = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['issues', 'map', filters, mapCenter.lat, mapCenter.lng],
    queryFn: () => issuesApi.getAll({ ...filters, limit: 200, lat: mapCenter.lat, lng: mapCenter.lng, radius: 50 }),
    refetchInterval: 30000,
  });

  // Sync react-query data to local state
  useEffect(() => {
    if (data?.data) {
      setLiveIssues(data.data);
    }
  }, [data?.data]);

  // Update map center when location is fetched
  useEffect(() => {
    if (location) {
      setMapCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  // Fetch location on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Handle Real-Time Updates
  useEffect(() => {
    if (!socket) return;
    
    const handleNewIssue = (issue) => {
      setLiveIssues((prev) => [issue, ...prev]);
    };

    const handleIssueUpdated = (updatedIssue) => {
      setLiveIssues((prev) => prev.map((i) => (i._id === updatedIssue._id ? updatedIssue : i)));
    };

    socket.on('issue:created', handleNewIssue);
    socket.on('issue:updated', handleIssueUpdated);
    socket.on('issue:status-changed', handleIssueUpdated);

    return () => {
      socket.off('issue:created', handleNewIssue);
      socket.off('issue:updated', handleIssueUpdated);
      socket.off('issue:status-changed', handleIssueUpdated);
    };
  }, [socket]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleGetLocation = () => {
    getLocation();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-dark-900">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <div className="glass-dark border border-white/10 rounded-2xl p-3 shadow-glass">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary-400" />
            <span className="text-sm font-semibold text-white">Live Map</span>
            <Badge variant="success" size="xs" dot>{liveIssues.length} issues</Badge>
          </div>

          <div className="flex gap-2">
            <Button size="xs" variant="secondary" icon={<Filter size={12} />} onClick={() => setShowFilters(!showFilters)}>
              Filters {activeFilterCount > 0 && <span className="ml-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
            </Button>
            <Button size="xs" variant="secondary" icon={<MapPin size={12} />} onClick={handleGetLocation}>
              My Location
            </Button>
          </div>
        </div>

        {/* Issue list on map */}
        {liveIssues.slice(0, 5).map((issue) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedIssue(issue)}
            className="glass-dark border border-white/10 rounded-xl p-3 cursor-pointer hover:border-primary-500/30 transition-all max-w-xs shadow-glass"
          >
            <div className="flex items-start gap-2">
              <span className="text-base">{CATEGORY_ICONS[issue.category]}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{issue.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs status-${issue.status} px-1.5 py-0.5 rounded-full`}>
                    {STATUS_LABELS[issue.status]}
                  </span>
                  <span className="text-xs text-slate-500">{issue.upvoteCount} ⭐</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={(updates) => setFilters(updates)}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Selected Issue Popup */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <IssuePopup issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Report FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/report')}
        className="absolute bottom-6 right-6 z-30 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow-lg text-white"
      >
        <Plus size={24} />
      </motion.button>

      {/* React Leaflet Map */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          {liveIssues.map((issue) => (
            <Marker
              key={issue._id}
              position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
              icon={createCustomIcon(issue.category)}
              eventHandlers={{
                click: () => setSelectedIssue(issue),
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
