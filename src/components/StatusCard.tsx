import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'period' | 'fertile' | 'safe' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  period: 'bg-period/10 border-period/30',
  fertile: 'bg-fertile/10 border-fertile/30',
  safe: 'bg-safe/10 border-safe/30',
  warning: 'bg-accent/10 border-accent/30',
};

const iconVariantStyles = {
  default: 'text-muted-foreground bg-muted',
  period: 'text-period bg-period/20',
  fertile: 'text-fertile bg-fertile/20',
  safe: 'text-safe bg-safe/20',
  warning: 'text-accent bg-accent/20',
};

export function StatusCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  className 
}: StatusCardProps) {
  return (
    <div 
      className={cn(
        'rounded-2xl border p-4 transition-all duration-300 hover:shadow-soft',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-xl', iconVariantStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
