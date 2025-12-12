import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CycleData, DayLog, Symptom, FlowIntensity, Mood } from '@/types/cycle';
import { getCycleData, saveCycleData } from '@/lib/storage';
import { toast } from 'sonner';

export function useCloudSync(userId: string | undefined) {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const syncToCloud = useCallback(async () => {
    if (!userId) return;

    const localData = getCycleData();
    if (!localData) return;

    setSyncing(true);
    try {
      // Check if cycle data exists
      const { data: existingData } = await supabase
        .from('cycle_data')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingData) {
        // Update existing
        const { error: cycleError } = await supabase
          .from('cycle_data')
          .update({
            cycle_length: localData.cycleLength,
            period_length: localData.periodLength,
            last_period_start: localData.lastPeriodStart,
            data: JSON.parse(JSON.stringify({ periodLogs: localData.periodLogs })),
          })
          .eq('user_id', userId);

        if (cycleError) throw cycleError;
      } else {
        // Insert new
        const { error: cycleError } = await supabase
          .from('cycle_data')
          .insert([{
            user_id: userId,
            cycle_length: localData.cycleLength,
            period_length: localData.periodLength,
            last_period_start: localData.lastPeriodStart,
            data: JSON.parse(JSON.stringify({ periodLogs: localData.periodLogs })),
          }]);

        if (cycleError) throw cycleError;
      }

      // Sync day logs one by one with upsert logic
      for (const dayLog of localData.dayLogs) {
        const { data: existingLog } = await supabase
          .from('day_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', dayLog.date)
          .maybeSingle();

        if (existingLog) {
          await supabase
            .from('day_logs')
            .update({
              mood: dayLog.mood || null,
              symptoms: dayLog.symptoms,
              flow_intensity: dayLog.flowIntensity || null,
              temperature: dayLog.temperature || null,
              notes: dayLog.notes || null,
            })
            .eq('id', existingLog.id);
        } else {
          await supabase
            .from('day_logs')
            .insert({
              user_id: userId,
              date: dayLog.date,
              mood: dayLog.mood || null,
              symptoms: dayLog.symptoms,
              flow_intensity: dayLog.flowIntensity || null,
              temperature: dayLog.temperature || null,
              notes: dayLog.notes || null,
            });
        }
      }

      setLastSynced(new Date());
      toast.success('Synced to cloud!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync to cloud');
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  const syncFromCloud = useCallback(async () => {
    if (!userId) return;

    setSyncing(true);
    try {
      // Fetch cycle data
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycle_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (cycleError) throw cycleError;

      if (!cycleData) {
        toast.info('No cloud data found');
        setSyncing(false);
        return;
      }

      // Fetch day logs
      const { data: dayLogs, error: logsError } = await supabase
        .from('day_logs')
        .select('*')
        .eq('user_id', userId);

      if (logsError) throw logsError;

      // Fetch period logs
      const { data: periodLogs, error: periodError } = await supabase
        .from('period_logs')
        .select('*')
        .eq('user_id', userId);

      if (periodError) throw periodError;

      // Transform to local format with proper type casting
      const transformedDayLogs: DayLog[] = (dayLogs || []).map(log => ({
        date: log.date,
        mood: (log.mood as Mood) || undefined,
        symptoms: (log.symptoms || []) as Symptom[],
        flowIntensity: (log.flow_intensity as FlowIntensity) || undefined,
        temperature: log.temperature ? Number(log.temperature) : undefined,
        notes: log.notes || undefined,
      }));

      const localData: CycleData = {
        cycleLength: cycleData.cycle_length,
        periodLength: cycleData.period_length,
        lastPeriodStart: cycleData.last_period_start,
        periodLogs: periodLogs?.map(log => ({
          startDate: log.start_date,
          flowIntensity: (log.flow_intensity as FlowIntensity) || 'medium',
        })) || (cycleData.data as any)?.periodLogs || [],
        dayLogs: transformedDayLogs,
      };

      saveCycleData(localData);
      setLastSynced(new Date());
      toast.success('Restored from cloud!');
      return localData;
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore from cloud');
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  return {
    syncing,
    lastSynced,
    syncToCloud,
    syncFromCloud,
  };
}
