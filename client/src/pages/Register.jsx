import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import Button from '@components/ui/Button';
import { authApi } from '@api/auth.api';
import { useAuthStore } from '@store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ name, email, password }) => {
    try {
      const res = await authApi.register({ name, email, password });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome to Community Hero, ${name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by api interceptor/toast
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', icon: <User size={16} /> },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: <Mail size={16} /> },
    { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters', icon: <Lock size={16} /> },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', icon: <Lock size={16} /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-hero-gradient">
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-md">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the Community Hero movement</p>
          </div>

          <a href="/api/auth/google" className="block mb-6">
            <Button variant="secondary" size="md" className="w-full" icon={
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }>
              Continue with Google
            </Button>
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-slate-500">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{field.icon}</span>
                  <input
                    {...register(field.name)}
                    type={field.name.includes('assword') ? (showPass ? 'text' : 'password') : field.type}
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-10 py-2.5 glass rounded-xl text-sm text-white placeholder-slate-500 border border-white/8 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  />
                  {field.name === 'password' && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-danger-400">{errors[field.name].message}</p>
                )}
              </div>
            ))}

            <p className="text-xs text-slate-500 pt-1">
              By signing up you agree to our{' '}
              <span className="text-primary-400">Terms of Service</span> and{' '}
              <span className="text-primary-400">Privacy Policy</span>.
            </p>

            <Button type="submit" size="md" className="w-full" loading={isSubmitting}>
              Create my account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
