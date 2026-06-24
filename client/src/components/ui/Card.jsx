import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';

export default function Card({ children, className, hover = true, glow = false, onClick, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={cn(
        'glass-card p-5',
        glow && 'shadow-glow-sm hover:shadow-glow-md',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return <div className={cn('mb-4 pb-4 border-b border-white/5', className)}>{children}</div>;
};

Card.Title = function CardTitle({ children, className }) {
  return <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>;
};

Card.Body = function CardBody({ children, className }) {
  return <div className={cn('space-y-3', className)}>{children}</div>;
};
