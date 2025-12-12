import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getCycleData } from '@/lib/storage';
import { useCycleCalculations } from '@/hooks/useCycleCalculations';
import { CycleData, SYMPTOM_LABELS, Symptom, MOOD_EMOJIS, Mood } from '@/types/cycle';
import { BottomNav } from '@/components/BottomNav';
import { StatusCard } from '@/components/StatusCard';
import { BBTChart } from '@/components/BBTChart';
import { MoodChart } from '@/components/MoodChart';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock,
  BarChart3,
  Droplets,
  Thermometer,
  Smile
} from 'lucide-react';

export default function History() {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const { stats, predictedCycleLength } = useCycleCalculations(cycleData);
  
  useEffect(() => {
    setCycleData(getCycleData());
  }, []);
  
  // Calculate most common symptoms
  const symptomCounts = cycleData?.dayLogs.reduce((acc, log) => {
    log.symptoms.forEach(symptom => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {} as Record<Symptom, number>) || {};
  
  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5) as [Symptom, number][];

  // Calculate mood distribution
  const moodCounts = cycleData?.dayLogs.reduce((acc, log) => {
    if (log.mood) {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<Mood, number>) || {};

  const hasMoodData = Object.keys(moodCounts).length > 0;
  
  if (!cycleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-serif font-semibold text-foreground">
          Statistics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights from your cycle history
        </p>
      </header>
      
      {/* Stats Grid */}
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            title="Avg Cycle"
            value={`${stats?.averageCycleLength || cycleData.cycleLength} days`}
            icon={Activity}
            variant="default"
          />
          <StatusCard
            title="Avg Period"
            value={`${stats?.averagePeriodLength || cycleData.periodLength} days`}
            icon={Droplets}
            variant="period"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            title="Cycles Logged"
            value={stats?.totalCyclesLogged || cycleData.periodLogs.length}
            icon={Calendar}
            variant="safe"
          />
          <StatusCard
            title="Variation"
            value={stats?.cycleVariation ? `±${stats.cycleVariation}` : '—'}
            subtitle="days"
            icon={TrendingUp}
            variant="default"
          />
        </div>
        
        {stats && stats.shortestCycle !== stats.longestCycle && (
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              title="Shortest"
              value={`${stats.shortestCycle} days`}
              icon={Clock}
              variant="default"
            />
            <StatusCard
              title="Longest"
              value={`${stats.longestCycle} days`}
              icon={Clock}
              variant="default"
            />
          </div>
        )}

        {/* Predicted Cycle Length */}
        {cycleData.periodLogs.length >= 2 && predictedCycleLength !== cycleData.cycleLength && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              AI-Predicted Cycle Length
            </div>
            <p className="text-xl font-semibold text-foreground">
              {predictedCycleLength} days
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your logged cycles (weighted toward recent data)
            </p>
          </div>
        )}
      </div>

      {/* Mood Chart */}
      {hasMoodData && (
        <div className="px-6 mt-8">
          <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smile className="w-5 h-5 text-primary" />
            Mood Patterns
          </h2>
          <MoodChart dayLogs={cycleData.dayLogs} />
          
          {/* Mood Distribution */}
          <div className="mt-4 bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">Mood Distribution</p>
            <div className="flex justify-between">
              {(['great', 'good', 'okay', 'bad', 'awful'] as Mood[]).map((mood) => {
                const count = moodCounts[mood] || 0;
                const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={mood} className="flex flex-col items-center">
                    <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
                    <span className="text-xs text-muted-foreground mt-1">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* BBT Chart */}
      {cycleData.dayLogs.some(log => log.temperature) && (
        <div className="px-6 mt-8">
          <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            Temperature Tracking
          </h2>
          <BBTChart dayLogs={cycleData.dayLogs} cycleLength={cycleData.cycleLength} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            A rise of 0.2-0.5°F after ovulation indicates ovulation has occurred
          </p>
        </div>
      )}

      {/* Top Symptoms */}
      {topSymptoms.length > 0 && (
        <div className="px-6 mt-8">
          <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Most Logged Symptoms
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {topSymptoms.map(([symptom, count], index) => {
              const maxCount = Math.max(...(Object.values(symptomCounts) as number[]));
              const numCount = count as number;
              return (
                <div 
                  key={symptom}
                  className={`flex items-center justify-between p-4 ${
                    index !== topSymptoms.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="text-foreground">
                    {SYMPTOM_LABELS[symptom]}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${maxCount > 0 ? (numCount / maxCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {numCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Period History */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-period" />
          Period History
        </h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {cycleData.periodLogs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No periods logged yet
            </div>
          ) : (
            [...cycleData.periodLogs]
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .slice(0, 6)
              .map((log, index, arr) => (
                <div 
                  key={log.startDate}
                  className={`flex items-center justify-between p-4 ${
                    index !== arr.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {format(parseISO(log.startDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {log.flowIntensity} flow
                    </p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-period" />
                </div>
              ))
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
