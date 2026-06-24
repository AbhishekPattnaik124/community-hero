import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin, Camera, Mic, MicOff, Image, X, ChevronRight,
  ChevronLeft, CheckCircle, Upload, AlertCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { issuesApi } from '@api/issues.api';
import { useGeolocation } from '@hooks/useGeolocation';
import { useVoiceRecognition } from '@hooks/useVoiceRecognition';
import { CATEGORY_ICONS, cn } from '@utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['roads', 'water', 'electricity', 'sanitation', 'parks', 'safety', 'noise', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const SEVERITY_COLORS = {
  low: 'border-green-500/30 bg-green-500/10 text-green-300',
  medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  critical: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const STEPS = ['Category', 'Details', 'Location', 'Photos', 'Review'];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  severity: z.string().min(1, 'Please select a severity'),
  address: z.string().optional(),
  city: z.string().optional(),
});

export default function ReportIssue() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState([]);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const navigate = useNavigate();
  const fileRef = useRef();

  const { location, loading: geoLoading, getLocation } = useGeolocation();
  const { transcript, isListening, isSupported, startListening, stopListening, reset: resetVoice } = useVoiceRecognition();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: '', severity: 'medium' },
  });

  const watchCategory = watch('category');
  const watchSeverity = watch('severity');
  const watchTitle = watch('title');
  const watchDescription = watch('description');

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);
      images.forEach((img) => formData.append('images', img.file));
      return issuesApi.create(formData);
    },
    onSuccess: (res) => {
      toast.success('Issue reported successfully! 🎉');
      navigate(`/issue/${res.data.issue._id}`);
    },
    onError: () => toast.error('Failed to report issue'),
  });

  const handleGetLocation = () => {
    getLocation();
    if (location) {
      setLat(location.lat);
      setLng(location.lng);
      setLocationLabel(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...previews].slice(0, 5));
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) setValue('description', transcript);
    } else {
      resetVoice();
      startListening();
    }
  };

  const canProceed = [
    () => !!watchCategory,
    () => watchTitle?.length >= 5 && watchDescription?.length >= 10,
    () => !!lat && !!lng,
    () => true,
  ];

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Report a Community Issue</h1>
        <p className="text-slate-400 text-sm">Help make your community better by reporting problems.</p>
      </motion.div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'flex-1 h-1 rounded-full transition-all duration-500',
              i < step ? 'bg-primary-500' : i === step ? 'bg-primary-400/60' : 'bg-white/5'
            )} />
            {i === STEPS.length - 1 && (
              <span className={cn('text-xs font-medium transition-colors', step >= i ? 'text-primary-300' : 'text-slate-600')}>
                {s}
              </span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Category */}
          {step === 0 && (
            <motion.div key="cat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">What type of issue is it?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat)}
                      className={cn(
                        'flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border text-sm font-medium transition-all duration-200',
                        watchCategory === cat
                          ? 'border-primary-500/60 bg-primary-500/15 text-primary-300 shadow-glow-sm'
                          : 'border-white/8 glass text-slate-400 hover:text-white hover:border-white/20'
                      )}
                    >
                      <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="capitalize">{cat}</span>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-danger-400 text-xs mt-3">{errors.category.message}</p>}
              </div>

              <div className="glass-card p-6 mt-4">
                <h3 className="text-sm font-semibold text-white mb-3">How severe is it?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('severity', s)}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-sm font-medium capitalize transition-all',
                        watchSeverity === s ? SEVERITY_COLORS[s] : 'border-white/8 glass text-slate-400 hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Issue Title *</label>
                  <input
                    {...register('title')}
                    placeholder="e.g. Large pothole on Main Street near bus stop"
                    className="w-full px-4 py-2.5 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 transition-all"
                  />
                  {errors.title && <p className="mt-1 text-xs text-danger-400">{errors.title.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-300">Description *</label>
                    {isSupported && (
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                          isListening ? 'bg-danger-500/20 text-danger-300 border border-danger-500/30 animate-pulse' : 'glass text-slate-400 hover:text-white'
                        )}
                      >
                        {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                        {isListening ? 'Stop recording' : 'Voice input'}
                      </button>
                    )}
                  </div>
                  <textarea
                    {...register('description')}
                    value={isListening ? transcript : undefined}
                    rows={5}
                    placeholder="Describe the issue in detail – location specifics, how long it's been there, safety hazards..."
                    className="w-full px-4 py-3 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  />
                  {isListening && (
                    <p className="text-xs text-danger-400 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-danger-400 animate-pulse" />
                      Listening... speak now
                    </p>
                  )}
                  {errors.description && <p className="mt-1 text-xs text-danger-400">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                    <input {...register('city')} placeholder="Bengaluru" className="w-full px-4 py-2.5 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Address / Landmark</label>
                    <input {...register('address')} placeholder="Near Metro Station" className="w-full px-4 py-2.5 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div key="loc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Pin the Location</h2>
                <p className="text-slate-400 text-sm mb-6">Allow location access or enter coordinates manually.</p>

                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  icon={<MapPin size={18} />}
                  loading={geoLoading}
                  className="w-full mb-4"
                  onClick={handleGetLocation}
                >
                  Use My Current Location
                </Button>

                {(lat && lng) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-success-500/10 border border-success-500/20 rounded-xl"
                  >
                    <CheckCircle size={20} className="text-success-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-success-300">Location captured!</p>
                      <p className="text-xs text-slate-400 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                    </div>
                  </motion.div>
                )}

                {!lat && !lng && (
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center text-slate-500">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No location selected yet</p>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-4 text-center">
                  Location is required so local authorities can find and fix the issue.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <motion.div key="photos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Add Photos</h2>
                <p className="text-slate-400 text-sm mb-5">Photos help authorities understand the severity. Max 5 images.</p>

                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center gap-3 text-slate-400 hover:text-white hover:border-primary-500/40 transition-all cursor-pointer group"
                >
                  <Upload size={32} className="group-hover:text-primary-400 transition-colors" />
                  <p className="text-sm font-medium">Click to upload photos</p>
                  <p className="text-xs text-slate-500">JPG, PNG, WebP – max 10MB each</p>
                </button>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-square rounded-xl overflow-hidden group"
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-1">Review & Submit</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white flex items-center gap-1.5">{CATEGORY_ICONS[watchCategory]} <span className="capitalize">{watchCategory}</span></span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Title</span>
                    <span className="text-white max-w-xs text-right">{watchTitle}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white font-mono text-xs">{lat ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Photos</span>
                    <span className="text-white">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full mt-4 shadow-glow-md" loading={mutation.isPending}>
                  Submit Report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button
              type="button"
              size="sm"
              iconRight={<ChevronRight size={16} />}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed[step]?.()}
            >
              Continue
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
