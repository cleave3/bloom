import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { CycleRing } from '@/components/CycleRing';
import { StatusCard } from '@/components/StatusCard';
import { Calendar, Droplets, Shield, AlertTriangle, Heart, Lock } from 'lucide-react';

interface SharedData {
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  insights: {
    currentDay: number;
    daysUntilPeriod: number;
    daysUntilOvulation: number;
    isFertileToday: boolean;
    isPeriodToday: boolean;
  };
}

export default function SharedView() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedData() {
      if (!shareCode) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Find the share
        const { data: share, error: shareError } = await supabase
          .from('partner_shares')
          .select('owner_id, is_active')
          .eq('share_code', shareCode)
          .single();

        if (shareError || !share) {
          setError('Share link not found');
          setLoading(false);
          return;
        }

        if (!share.is_active) {
          setError('This share link has been deactivated');
          setLoading(false);
          return;
        }

        // Fetch cycle data
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycle_data')
          .select('*')
          .eq('user_id', share.owner_id)
          .single();

        if (cycleError || !cycleData) {
          setError('No cycle data available');
          setLoading(false);
          return;
        }

        // Calculate insights
        const lastPeriod = parseISO(cycleData.last_period_start);
        const today = new Date();
        const cycleLength = cycleData.cycle_length;
        const periodLength = cycleData.period_length;

        const daysSinceStart = differenceInDays(today, lastPeriod);
        const currentDay = (daysSinceStart % cycleLength) + 1;
        const daysUntilPeriod = cycleLength - currentDay + 1;
        const ovulationDay = cycleLength - 14;
        const daysUntilOvulation = ovulationDay - currentDay;

        const isPeriodToday = currentDay <= periodLength;
        const fertileStart = ovulationDay - 5;
        const fertileEnd = ovulationDay + 1;
        const isFertileToday = currentDay >= fertileStart && currentDay <= fertileEnd;

        setData({
          cycleLength,
          periodLength,
          lastPeriodStart: cycleData.last_period_start,
          insights: {
            currentDay,
            daysUntilPeriod: daysUntilPeriod > 0 ? daysUntilPeriod : 0,
            daysUntilOvulation: daysUntilOvulation > 0 ? daysUntilOvulation : 0,
            isFertileToday,
            isPeriodToday,
          },
        });
      } catch (err) {
        console.error('Error fetching shared data:', err);
        setError('Failed to load shared data');
      } finally {
        setLoading(false);
      }
    }

    fetchSharedData();
  }, [shareCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">{error}</h1>
        <p className="text-muted-foreground text-center">
          The share link may be invalid or has been deactivated.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const getFertilityStatus = () => {
    if (data.insights.isPeriodToday) {
      return { text: 'Period Day', variant: 'period' as const, icon: Droplets };
    }
    if (data.insights.isFertileToday) {
      return { text: 'Fertile Window', variant: 'fertile' as const, icon: AlertTriangle };
    }
    return { text: 'Low Fertility', variant: 'safe' as const, icon: Shield };
  };

  const fertilityStatus = getFertilityStatus();

  // Create a minimal insights object for CycleRing
  const insightsForRing = {
    currentDay: data.insights.currentDay,
    daysUntilPeriod: data.insights.daysUntilPeriod,
    daysUntilOvulation: data.insights.daysUntilOvulation,
    currentPhase: data.insights.isPeriodToday 
      ? 'menstrual' as const 
      : data.insights.isFertileToday 
        ? 'ovulation' as const 
        : 'follicular' as const,
    fertileWindowStart: new Date(),
    fertileWindowEnd: new Date(),
    ovulationDate: new Date(),
    nextPeriodDate: addDays(new Date(), data.insights.daysUntilPeriod),
    isFertileToday: data.insights.isFertileToday,
    isPeriodToday: data.insights.isPeriodToday,
    isOvulationToday: false,
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium">Shared View</span>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">
          Cycle Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Limited view for partner awareness
        </p>
      </header>

      {/* Cycle Ring */}
      <div className="flex justify-center mb-8">
        <CycleRing 
          insights={insightsForRing}
          cycleLength={data.cycleLength}
          periodLength={data.periodLength}
        />
      </div>

      {/* Status Cards */}
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            title="Next Period"
            value={`${data.insights.daysUntilPeriod} days`}
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
      </div>

      {/* Privacy Notice */}
      <div className="px-6 mt-8">
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This is a limited view. Detailed symptoms and notes are private.
          </p>
        </div>
      </div>
    </div>
  );
}
