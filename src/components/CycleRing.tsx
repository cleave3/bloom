import { CycleInsights } from '@/types/cycle';

interface CycleRingProps {
  insights: CycleInsights;
  cycleLength: number;
  periodLength: number;
}

export function CycleRing({ insights, cycleLength, periodLength }: CycleRingProps) {
  const size = 240;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate segment angles
  const periodAngle = (periodLength / cycleLength) * 360;
  const fertileStart = ((cycleLength - 14 - 5) / cycleLength) * 360;
  const fertileAngle = (7 / cycleLength) * 360;
  const currentAngle = ((insights.currentDay - 1) / cycleLength) * 360;
  
  // SVG arc helper
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(size / 2, size / 2, radius, endAngle - 90);
    const end = polarToCartesian(size / 2, size / 2, radius, startAngle - 90);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };
  
  // Current position marker
  const markerPos = polarToCartesian(size / 2, size / 2, radius, currentAngle - 90);
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        
        {/* Safe days (green) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--safe))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          className="opacity-60"
        />
        
        {/* Period segment (coral) */}
        <path
          d={describeArc(0, periodAngle)}
          fill="none"
          stroke="hsl(var(--period))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Fertile window segment (pink) */}
        <path
          d={describeArc(fertileStart, fertileStart + fertileAngle)}
          fill="none"
          stroke="hsl(var(--fertile))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Current position marker */}
      <div 
        className="absolute w-6 h-6 bg-card border-4 border-accent rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        style={{
          left: markerPos.x,
          top: markerPos.y,
        }}
      />
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-serif font-semibold text-foreground">
          {insights.currentDay}
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          of {cycleLength} days
        </span>
      </div>
    </div>
  );
}
