import { useState, useEffect, useMemo } from 'react';
import { addMonths, startOfMonth } from 'date-fns';
import { getCycleData } from '@/lib/storage';
import { useCycleCalculations } from '@/hooks/useCycleCalculations';
import { CycleData, DayStatus } from '@/types/cycle';
import { CalendarMonth } from '@/components/CalendarMonth';
import { Legend } from '@/components/Legend';
import { DayDetailSheet } from '@/components/DayDetailSheet';
import { BottomNav } from '@/components/BottomNav';

export default function CalendarPage() {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<DayStatus | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { getDayStatus } = useCycleCalculations(cycleData);
  
  useEffect(() => {
    setCycleData(getCycleData());
  }, []);
  
  const refreshData = () => {
    setCycleData(getCycleData());
  };
  
  // Generate months to display (2 past + current + 3 future)
  const months = useMemo(() => {
    const today = startOfMonth(new Date());
    return Array.from({ length: 6 }, (_, i) => addMonths(today, i - 2));
  }, []);
  
  const handleDayClick = (date: Date, status: DayStatus) => {
    setSelectedDate(date);
    setSelectedStatus(status);
    setSheetOpen(true);
  };
  
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
      <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 pt-12 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-serif font-semibold text-foreground">
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tap any day to log symptoms
        </p>
      </header>
      
      {/* Legend */}
      <div className="px-6 py-4">
        <Legend />
      </div>
      
      {/* Scrollable Calendar */}
      <div className="px-6 space-y-8 pb-4">
        {months.map((month) => (
          <CalendarMonth
            key={month.toISOString()}
            month={month}
            getDayStatus={getDayStatus}
            onDayClick={handleDayClick}
          />
        ))}
      </div>
      
      {/* Day Detail Sheet */}
      <DayDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDate}
        status={selectedStatus}
        onUpdate={refreshData}
      />
      
      <BottomNav />
    </div>
  );
}
