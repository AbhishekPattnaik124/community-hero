import { cn } from '@utils/helpers';

const variants = {
  default:  'bg-white/10 text-white',
  primary:  'bg-primary-500/20 text-primary-300 border border-primary-500/30',
  success:  'bg-success-500/20 text-success-400 border border-success-500/30',
  warning:  'bg-warning-500/20 text-warning-400 border border-warning-500/30',
  danger:   'bg-danger-500/20 text-danger-400 border border-danger-500/30',
  accent:   'bg-accent-500/20 text-accent-400 border border-accent-500/30',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ children, variant = 'default', size = 'sm', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', {
          'bg-primary-400': variant === 'primary',
          'bg-success-400': variant === 'success',
          'bg-warning-400': variant === 'warning',
          'bg-danger-400': variant === 'danger',
          'bg-accent-400': variant === 'accent',
          'bg-white': variant === 'default',
        })} />
      )}
      {children}
    </span>
  );
}
