import { useMemo } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { DayLog, Mood, MOOD_EMOJIS } from '@/types/cycle';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface MoodChartProps {
  dayLogs: DayLog[];
}

const MOOD_VALUES: Record<Mood, number> = {
  awful: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const VALUE_TO_MOOD: Record<number, Mood> = {
  1: 'awful',
  2: 'bad',
  3: 'okay',
  4: 'good',
  5: 'great',
};

export function MoodChart({ dayLogs }: MoodChartProps) {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = dayLogs.find(l => l.date === dateStr);
      
      return {
        date: dateStr,
        displayDate: format(date, 'MMM d'),
        mood: log?.mood ? MOOD_VALUES[log.mood] : null,
        moodLabel: log?.mood,
      };
    });

    return last30Days.filter(d => d.mood !== null);
  }, [dayLogs]);

  if (chartData.length < 2) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-muted-foreground">
          Log your mood for at least 2 days to see patterns
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const mood = VALUE_TO_MOOD[data.mood];
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.displayDate}</p>
          <p className="text-lg">
            {MOOD_EMOJIS[mood]} {mood}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            tickFormatter={(value) => MOOD_EMOJIS[VALUE_TO_MOOD[value]]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
