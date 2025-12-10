import { CyclePhase } from '@/types/cycle';
import { cn } from '@/lib/utils';
import { Droplets, Flower2, Sun, Moon } from 'lucide-react';

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseConfig: Record<CyclePhase, {
  label: string;
  description: string;
  icon: typeof Droplets;
  colorClass: string;
  bgClass: string;
}> = {
  menstrual: {
    label: 'Menstrual',
    description: 'Period days',
    icon: Droplets,
    colorClass: 'text-period',
    bgClass: 'bg-period/10',
  },
  follicular: {
    label: 'Follicular',
    description: 'Building up',
    icon: Flower2,
    colorClass: 'text-safe',
    bgClass: 'bg-safe/10',
  },
  ovulation: {
    label: 'Ovulation',
    description: 'Peak fertility',
    icon: Sun,
    colorClass: 'text-fertile',
    bgClass: 'bg-fertile/10',
  },
  luteal: {
    label: 'Luteal',
    description: 'Post-ovulation',
    icon: Moon,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
  },
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-2xl',
      config.bgClass,
      className
    )}>
      <div className={cn('p-3 rounded-xl bg-card shadow-sm', config.colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className={cn('font-semibold', config.colorClass)}>
          {config.label} Phase
        </h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}
