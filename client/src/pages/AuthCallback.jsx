import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { authApi, handleOAuthCallback } from '@api/auth.api';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const { token, refresh } = handleOAuthCallback();

    if (!token) {
      toast.error('Authentication failed');
      navigate('/login');
      return;
    }

    // Store tokens and fetch user
    (async () => {
      try {
        // Temporarily set token to fetch /me
        useAuthStore.setState({ accessToken: token });
        const res = await authApi.me();
        setAuth(res.data.user, token, refresh);
        toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}! 🎉`);
        navigate('/dashboard');
      } catch {
        toast.error('Authentication failed');
        navigate('/login');
      }
    })();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="text-primary-400 animate-spin" />
      <p className="text-slate-400 text-sm">Completing sign-in...</p>
    </div>
  );
}
