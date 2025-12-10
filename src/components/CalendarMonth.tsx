import { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth 
} from 'date-fns';
import { DayStatus } from '@/types/cycle';
import { cn } from '@/lib/utils';

interface CalendarMonthProps {
  month: Date;
  getDayStatus: (date: Date) => DayStatus;
  onDayClick?: (date: Date, status: DayStatus) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarMonth({ month, getDayStatus, onDayClick }: CalendarMonthProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);
  
  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-serif font-semibold text-foreground mb-4 px-1">
        {format(month, 'MMMM yyyy')}
      </h3>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div 
            key={day} 
            className="text-xs text-muted-foreground text-center py-2 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const status = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, month);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day, status)}
              disabled={!isCurrentMonth}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200',
                'hover:scale-105 active:scale-95',
                !isCurrentMonth && 'opacity-30 cursor-default hover:scale-100',
                isCurrentMonth && 'cursor-pointer',
                // Status-based styling
                status.isToday && 'ring-2 ring-accent ring-offset-2 ring-offset-background',
                status.isPeriod && isCurrentMonth && 'bg-period text-white font-medium',
                status.isOvulation && isCurrentMonth && !status.isPeriod && 'bg-ovulation text-foreground font-medium',
                status.isFertile && isCurrentMonth && !status.isPeriod && !status.isOvulation && 'bg-fertile/40 text-foreground',
                status.isSafe && isCurrentMonth && !status.isPeriod && 'bg-safe/30 text-foreground',
                status.isPredicted && isCurrentMonth && 'opacity-70',
                // Has log indicator
                status.dayLog && 'relative'
              )}
            >
              <span>{format(day, 'd')}</span>
              {status.dayLog && isCurrentMonth && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
