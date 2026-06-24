import { useEffect } from 'react';
import { SocketProvider } from '@context/SocketContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/authStore';
import { useThemeStore } from '@store/themeStore';
import Navbar from '@components/layout/Navbar';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import MapView from '@pages/MapView';
import IssueDetail from '@pages/IssueDetail';
import ReportIssue from '@pages/ReportIssue';
import Profile from '@pages/Profile';
import AdminDashboard from '@pages/AdminDashboard';
import AuthorityKanban from '@pages/AuthorityKanban';
import WarRoom from '@pages/WarRoom';
import Showcase from '@pages/Showcase';
import AuthCallback from '@pages/AuthCallback';
import NotFound from '@pages/NotFound';
import FinancialDashboard from '@pages/Impact/FinancialDashboard';
import Scorecard from '@pages/Transparency/Scorecard';
import FilingDashboard from '@pages/Complaints/FilingDashboard';
import SocialListeningDashboard from '@pages/Admin/SocialListeningDashboard';
import GodTierAnalytics from '@pages/Admin/GodTierAnalytics';
import Leaderboard from '@pages/Leaderboard';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fff', zIndex: 9999, position: 'relative' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function PrivateRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}


export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <SocketProvider>
      <div className={`min-h-screen ${isDark ? 'bg-dark-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Showcase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/map" element={<MapView />} />
          <Route path="/issue/:id" element={<IssueDetail />} />
          <Route path="/report" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['admin', 'authority']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/authority/kanban" element={<PrivateRoute roles={['admin', 'authority']}><AuthorityKanban /></PrivateRoute>} />
          <Route path="/war-room" element={<WarRoom />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/impact/financial" element={<FinancialDashboard />} />
          <Route path="/transparency/scorecard" element={<Scorecard />} />
          <Route path="/complaints/auto-file" element={<PrivateRoute><FilingDashboard /></PrivateRoute>} />
          <Route path="/admin/social-listening" element={<PrivateRoute roles={['admin', 'authority']}><SocialListeningDashboard /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute roles={['admin', 'authority']}><GodTierAnalytics /></PrivateRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}
