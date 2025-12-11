import { useMemo } from 'react';
import { DayLog } from '@/types/cycle';
import { format, parseISO, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface BBTChartProps {
  dayLogs: DayLog[];
  cycleLength: number;
}

export function BBTChart({ dayLogs, cycleLength }: BBTChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const daysToShow = Math.min(cycleLength, 35);
    
    // Get temperatures for the last cycle
    const data: { date: string; temp: number | null; dayLabel: string }[] = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = dayLogs.find(l => l.date === dateStr);
      
      data.push({
        date: dateStr,
        temp: log?.temperature ?? null,
        dayLabel: format(date, 'MMM d'),
      });
    }
    
    return data;
  }, [dayLogs, cycleLength]);

  const validTemps = chartData.filter(d => d.temp !== null).map(d => d.temp as number);
  const avgTemp = validTemps.length > 0 
    ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length 
    : 97.5;
  
  const minTemp = validTemps.length > 0 ? Math.min(...validTemps) - 0.5 : 96.5;
  const maxTemp = validTemps.length > 0 ? Math.max(...validTemps) + 0.5 : 99;

  if (validTemps.length < 2) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-muted-foreground">
          Log at least 2 days of temperature to see your BBT chart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="dayLabel" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[minTemp, maxTemp]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}°F`, 'Temperature']}
            labelFormatter={(label) => label}
          />
          <ReferenceLine 
            y={avgTemp} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
          />
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Your BBT
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-px bg-primary opacity-50" style={{ borderBottom: '2px dashed' }} />
          Average ({avgTemp.toFixed(1)}°F)
        </span>
      </div>
    </div>
  );
}
