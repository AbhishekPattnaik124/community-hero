import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bell, User, LogOut, Settings, Menu, X,
  LayoutDashboard, Plus, Shield, Sun, Moon, Zap
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useThemeStore } from '@store/themeStore';
import { usersApi } from '@api/users.api';
import { authApi } from '@api/auth.api';
import { useQuery } from '@tanstack/react-query';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { cn } from '@utils/helpers';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/map', label: 'Live Map', icon: <MapPin size={16} /> },
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, auth: true },
  { to: '/report', label: 'Report Issue', icon: <Plus size={16} />, auth: true, highlight: true },
  { to: '/admin', label: 'Admin', icon: <Shield size={16} />, roles: ['admin', 'authority'] },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Notification count
  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => usersApi.getNotifications({ unreadOnly: true, limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadCount = notifData?.pagination?.unreadCount || 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  const visibleLinks = navLinks.filter((link) => {
    if (link.auth && !isAuthenticated) return false;
    if (link.roles && !link.roles.includes(user?.role)) return false;
    return true;
  });

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass border-b border-white/8 shadow-glass'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm"
            >
              <Zap size={16} className="text-white" />
            </motion.div>
            <span className="font-display font-bold text-lg gradient-text hidden sm:block">
              Community Hero
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return link.highlight ? (
                <Button key={link.to} size="sm" variant="accent" icon={link.icon} onClick={() => navigate(link.to)}>
                  {link.label}
                </Button>
              ) : (
                <Link key={link.to} to={link.to}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </motion.span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <Link to="/dashboard?tab=notifications">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-12 z-50 w-56 glass-dark rounded-2xl shadow-glass overflow-hidden border border-white/8"
                        >
                          <div className="p-3 border-b border-white/5">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <Badge variant="primary" size="xs">Lv.{user?.level || 1}</Badge>
                              <Badge variant="default" size="xs">{user?.points || 0} pts</Badge>
                            </div>
                          </div>
                          <div className="p-1">
                            {[
                              { to: '/profile', label: 'Profile', icon: <User size={14} /> },
                              { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                              >
                                {item.icon}
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <div className="p-1 border-t border-white/5">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded-xl transition-colors"
                            >
                              <LogOut size={14} />
                              Log out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Sign up</Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 glass"
            >
              <div className="px-4 py-3 space-y-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      location.pathname === link.to
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/login')}>Log in</Button>
                    <Button size="sm" className="flex-1" onClick={() => navigate('/register')}>Sign up</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
