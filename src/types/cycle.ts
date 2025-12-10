export type FlowIntensity = 'light' | 'medium' | 'heavy' | 'spotting';

export type Symptom = 
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'fatigue'
  | 'mood_swings'
  | 'breast_tenderness'
  | 'acne'
  | 'backache'
  | 'nausea'
  | 'cravings';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PeriodLog {
  startDate: string; // ISO date string
  endDate?: string;
  flowIntensity: FlowIntensity;
}

export interface DayLog {
  date: string; // ISO date string
  symptoms: Symptom[];
  flowIntensity?: FlowIntensity;
  notes?: string;
}

export interface CycleData {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  periodLogs: PeriodLog[];
  dayLogs: DayLog[];
}

export interface UserSettings {
  onboardingComplete: boolean;
  cycleData: CycleData | null;
}

export interface CycleInsights {
  currentDay: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  currentPhase: CyclePhase;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  nextPeriodDate: Date;
  isFertileToday: boolean;
  isPeriodToday: boolean;
  isOvulationToday: boolean;
}

export interface DayStatus {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isSafe: boolean;
  isToday: boolean;
  isPredicted: boolean;
  dayLog?: DayLog;
}

export interface CycleStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  totalCyclesLogged: number;
  cycleVariation: number;
  shortestCycle: number;
  longestCycle: number;
}

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Fatigue',
  mood_swings: 'Mood Swings',
  breast_tenderness: 'Breast Tenderness',
  acne: 'Acne',
  backache: 'Backache',
  nausea: 'Nausea',
  cravings: 'Cravings',
};

export const FLOW_LABELS: Record<FlowIntensity, string> = {
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};
