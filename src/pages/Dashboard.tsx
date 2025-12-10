import { useEffect, useState } from 'react';
import { getCycleData } from '@/lib/storage';
import { useCycleCalculations } from '@/hooks/useCycleCalculations';
import { CycleData } from '@/types/cycle';
import { CycleRing } from '@/components/CycleRing';
import { StatusCard } from '@/components/StatusCard';
import { PhaseIndicator } from '@/components/PhaseIndicator';
import { BottomNav } from '@/components/BottomNav';
import { Calendar, Droplets, Shield, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const { insights } = useCycleCalculations(cycleData);
  
  useEffect(() => {
    setCycleData(getCycleData());
  }, []);
  
  if (!cycleData || !insights) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  const getFertilityStatus = () => {
    if (insights.isPeriodToday) {
      return { text: 'Period Day', variant: 'period' as const, icon: Droplets };
    }
    if (insights.isOvulationToday) {
      return { text: 'Peak Fertility', variant: 'warning' as const, icon: AlertTriangle };
    }
    if (insights.isFertileToday) {
      return { text: 'Fertile Window', variant: 'fertile' as const, icon: AlertTriangle };
    }
    return { text: 'Low Fertility', variant: 'safe' as const, icon: Shield };
  };
  
  const fertilityStatus = getFertilityStatus();
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <h1 className="text-2xl font-serif font-semibold text-foreground">
          Bloom
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your cycle at a glance
        </p>
      </header>
      
      {/* Cycle Ring */}
      <div className="flex justify-center mb-8">
        <CycleRing 
          insights={insights}
          cycleLength={cycleData.cycleLength}
          periodLength={cycleData.periodLength}
        />
      </div>
      
      {/* Phase Indicator */}
      <div className="px-6 mb-6">
        <PhaseIndicator phase={insights.currentPhase} />
      </div>
      
      {/* Status Cards */}
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            title="Next Period"
            value={`${insights.daysUntilPeriod} days`}
            icon={Calendar}
            variant="period"
          />
          <StatusCard
            title="Fertility"
            value={fertilityStatus.text}
            icon={fertilityStatus.icon}
            variant={fertilityStatus.variant}
          />
        </div>
        
        <StatusCard
          title="Ovulation"
          value={insights.daysUntilOvulation <= 0 ? 'Today' : `In ${insights.daysUntilOvulation} days`}
          subtitle={insights.isFertileToday ? 'Use protection if avoiding pregnancy' : 'Currently outside fertile window'}
          icon={AlertTriangle}
          variant={insights.isFertileToday ? 'warning' : 'default'}
          className="w-full"
        />
      </div>
      
      {/* Quick Tips */}
      <div className="px-6 mt-6">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-medium text-foreground mb-2">
            💡 Today's Tip
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insights.isFertileToday 
              ? "You're in your fertile window. If you're trying to prevent pregnancy, use protection or abstain."
              : insights.isPeriodToday
              ? "Stay hydrated and get plenty of rest. Consider light exercise to help with cramps."
              : "Track your symptoms daily to better understand your cycle patterns over time."}
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
