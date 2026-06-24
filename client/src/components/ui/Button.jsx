import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-sm hover:shadow-glow-md border border-primary-500/30',
  secondary: 'glass text-white hover:bg-white/10 border-white/10',
  ghost: 'hover:bg-white/5 text-slate-300 hover:text-white',
  danger: 'bg-danger-600 hover:bg-danger-500 text-white border border-danger-500/30',
  accent: 'bg-accent-500 hover:bg-accent-600 text-white border border-accent-400/30',
  outline: 'border border-primary-500 text-primary-400 hover:bg-primary-500/10',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3.5 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className, loading, icon, iconRight, disabled, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  );
});

export default Button;
