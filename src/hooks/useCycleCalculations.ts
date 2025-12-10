import { useMemo } from 'react';
import { 
  CycleData, 
  CycleInsights, 
  CyclePhase, 
  DayStatus,
  CycleStats 
} from '@/types/cycle';
import { 
  differenceInDays, 
  addDays, 
  startOfDay, 
  isSameDay,
  format,
  parseISO
} from 'date-fns';

export function useCycleCalculations(cycleData: CycleData | null) {
  const insights = useMemo<CycleInsights | null>(() => {
    if (!cycleData) return null;
    
    const today = startOfDay(new Date());
    const lastPeriod = startOfDay(parseISO(cycleData.lastPeriodStart));
    const cycleLength = cycleData.cycleLength;
    
    // Calculate current day in cycle (1-indexed)
    const daysSinceLastPeriod = differenceInDays(today, lastPeriod);
    const currentDay = (daysSinceLastPeriod % cycleLength) + 1;
    
    // Calculate next period
    const cyclesSinceLast = Math.floor(daysSinceLastPeriod / cycleLength);
    const nextPeriodDate = addDays(lastPeriod, (cyclesSinceLast + 1) * cycleLength);
    const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
    
    // Calculate ovulation (typically 14 days before next period)
    const ovulationDay = cycleLength - 14;
    const currentCycleStart = addDays(lastPeriod, cyclesSinceLast * cycleLength);
    const ovulationDate = addDays(currentCycleStart, ovulationDay - 1);
    const daysUntilOvulation = differenceInDays(ovulationDate, today);
    
    // Fertile window: 5 days before ovulation to 1 day after
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);
    
    // Determine current phase
    let currentPhase: CyclePhase;
    if (currentDay <= cycleData.periodLength) {
      currentPhase = 'menstrual';
    } else if (currentDay < ovulationDay - 5) {
      currentPhase = 'follicular';
    } else if (currentDay >= ovulationDay - 5 && currentDay <= ovulationDay + 1) {
      currentPhase = 'ovulation';
    } else {
      currentPhase = 'luteal';
    }
    
    // Check today's status
    const isFertileToday = today >= fertileWindowStart && today <= fertileWindowEnd;
    const isPeriodToday = currentDay <= cycleData.periodLength;
    const isOvulationToday = isSameDay(today, ovulationDate);
    
    return {
      currentDay,
      daysUntilPeriod,
      daysUntilOvulation: daysUntilOvulation < 0 ? daysUntilOvulation + cycleLength : daysUntilOvulation,
      currentPhase,
      fertileWindowStart,
      fertileWindowEnd,
      ovulationDate,
      nextPeriodDate,
      isFertileToday,
      isPeriodToday,
      isOvulationToday,
    };
  }, [cycleData]);
  
  const getDayStatus = useMemo(() => {
    return (date: Date): DayStatus => {
      if (!cycleData) {
        return {
          date,
          isPeriod: false,
          isFertile: false,
          isOvulation: false,
          isSafe: true,
          isToday: isSameDay(date, new Date()),
          isPredicted: true,
        };
      }
      
      const today = startOfDay(new Date());
      const checkDate = startOfDay(date);
      const lastPeriod = startOfDay(parseISO(cycleData.lastPeriodStart));
      const cycleLength = cycleData.cycleLength;
      
      const daysSinceLastPeriod = differenceInDays(checkDate, lastPeriod);
      const dayInCycle = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength + 1;
      
      const ovulationDay = cycleLength - 14;
      const isPeriod = dayInCycle <= cycleData.periodLength;
      const isFertile = dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1;
      const isOvulation = dayInCycle === ovulationDay;
      const isSafe = !isPeriod && !isFertile;
      
      // Check if we have a log for this day
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayLog = cycleData.dayLogs.find(log => log.date === dateStr);
      
      return {
        date: checkDate,
        isPeriod,
        isFertile,
        isOvulation,
        isSafe,
        isToday: isSameDay(checkDate, today),
        isPredicted: checkDate > today,
        dayLog,
      };
    };
  }, [cycleData]);
  
  const stats = useMemo<CycleStats | null>(() => {
    if (!cycleData || cycleData.periodLogs.length < 2) return null;
    
    const sortedLogs = [...cycleData.periodLogs].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const cycleLengths: number[] = [];
    for (let i = 1; i < sortedLogs.length; i++) {
      const diff = differenceInDays(
        parseISO(sortedLogs[i].startDate),
        parseISO(sortedLogs[i - 1].startDate)
      );
      if (diff > 0 && diff < 60) { // Sanity check
        cycleLengths.push(diff);
      }
    }
    
    if (cycleLengths.length === 0) {
      return {
        averageCycleLength: cycleData.cycleLength,
        averagePeriodLength: cycleData.periodLength,
        totalCyclesLogged: cycleData.periodLogs.length,
        cycleVariation: 0,
        shortestCycle: cycleData.cycleLength,
        longestCycle: cycleData.cycleLength,
      };
    }
    
    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / cycleLengths.length;
    
    return {
      averageCycleLength: Math.round(avg),
      averagePeriodLength: cycleData.periodLength,
      totalCyclesLogged: cycleData.periodLogs.length,
      cycleVariation: Math.round(Math.sqrt(variance) * 10) / 10,
      shortestCycle: Math.min(...cycleLengths),
      longestCycle: Math.max(...cycleLengths),
    };
  }, [cycleData]);
  
  return { insights, getDayStatus, stats };
}
