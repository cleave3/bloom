import { UserSettings, CycleData, DayLog } from '@/types/cycle';

const STORAGE_KEY = 'cycle-tracker-data';

const defaultSettings: UserSettings = {
  onboardingComplete: false,
  cycleData: null,
};

export function getSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    return JSON.parse(stored) as UserSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function saveCycleData(cycleData: CycleData): void {
  const settings = getSettings();
  settings.cycleData = cycleData;
  settings.onboardingComplete = true;
  saveSettings(settings);
}

export function getCycleData(): CycleData | null {
  return getSettings().cycleData;
}

export function isOnboardingComplete(): boolean {
  return getSettings().onboardingComplete;
}

export function completeOnboarding(): void {
  const settings = getSettings();
  settings.onboardingComplete = true;
  saveSettings(settings);
}

export function addPeriodLog(startDate: string, flowIntensity: 'light' | 'medium' | 'heavy' | 'spotting' = 'medium'): void {
  const settings = getSettings();
  if (!settings.cycleData) return;
  
  settings.cycleData.periodLogs.push({
    startDate,
    flowIntensity,
  });
  settings.cycleData.lastPeriodStart = startDate;
  saveSettings(settings);
}

export function updateDayLog(dayLog: DayLog): void {
  const settings = getSettings();
  if (!settings.cycleData) return;
  
  const existingIndex = settings.cycleData.dayLogs.findIndex(
    (log) => log.date === dayLog.date
  );
  
  if (existingIndex >= 0) {
    settings.cycleData.dayLogs[existingIndex] = dayLog;
  } else {
    settings.cycleData.dayLogs.push(dayLog);
  }
  
  saveSettings(settings);
}

export function getDayLog(date: string): DayLog | undefined {
  const settings = getSettings();
  return settings.cycleData?.dayLogs.find((log) => log.date === date);
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(): string {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultSettings);
}

export function importData(data: string): boolean {
  try {
    const parsed = JSON.parse(data) as UserSettings;
    saveSettings(parsed);
    return true;
  } catch {
    return false;
  }
}
