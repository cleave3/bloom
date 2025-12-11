import { useEffect, useCallback } from 'react';
import { getCycleData, getNotificationSettings, saveNotificationSettings } from '@/lib/storage';
import { useCycleCalculations } from './useCycleCalculations';

export interface NotificationSettings {
  enabled: boolean;
  periodReminder: boolean;
  fertileReminder: boolean;
  lastNotificationDate: string | null;
}

export function useNotifications() {
  const cycleData = getCycleData();
  const { insights } = useCycleCalculations(cycleData);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.svg',
        badge: '/pwa-192x192.svg',
        tag: 'cycle-tracker',
      });
    }
  }, []);

  const checkAndNotify = useCallback(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !insights) return;

    const today = new Date().toDateString();
    if (settings.lastNotificationDate === today) return;

    // Period reminder - notify 2 days before
    if (settings.periodReminder && insights.daysUntilPeriod <= 2 && insights.daysUntilPeriod > 0) {
      showNotification(
        '🌸 Period Coming Soon',
        `Your period is expected in ${insights.daysUntilPeriod} day${insights.daysUntilPeriod > 1 ? 's' : ''}. Be prepared!`
      );
      saveNotificationSettings({ ...settings, lastNotificationDate: today });
    }

    // Fertile window reminder
    if (settings.fertileReminder && insights.isFertileToday) {
      const lastFertileNotify = localStorage.getItem('last-fertile-notify');
      if (lastFertileNotify !== today) {
        showNotification(
          '🌷 Fertile Window',
          'You are currently in your fertile window. Take precautions if preventing pregnancy.'
        );
        localStorage.setItem('last-fertile-notify', today);
        saveNotificationSettings({ ...settings, lastNotificationDate: today });
      }
    }
  }, [insights, showNotification]);

  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      saveNotificationSettings({
        enabled: true,
        periodReminder: true,
        fertileReminder: true,
        lastNotificationDate: null,
      });
      return true;
    }
    return false;
  }, [requestPermission]);

  const disableNotifications = useCallback(() => {
    saveNotificationSettings({
      enabled: false,
      periodReminder: false,
      fertileReminder: false,
      lastNotificationDate: null,
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const current = getNotificationSettings();
    saveNotificationSettings({ ...current, ...updates });
  }, []);

  // Check for notifications on mount
  useEffect(() => {
    checkAndNotify();
  }, [checkAndNotify]);

  return {
    settings: getNotificationSettings(),
    requestPermission,
    enableNotifications,
    disableNotifications,
    updateSettings,
    checkAndNotify,
    isSupported: 'Notification' in window,
    permissionStatus: 'Notification' in window ? Notification.permission : 'denied',
  };
}
