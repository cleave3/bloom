import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { getCycleData, saveCycleData, resetAllData, addPeriodLog, getNotificationSettings, saveNotificationSettings } from '@/lib/storage';
import { downloadCSV, downloadPDF } from '@/lib/export';
import { CycleData, FlowIntensity, FLOW_LABELS } from '@/types/cycle';
import { BottomNav } from '@/components/BottomNav';
import { CloudSyncSection } from '@/components/CloudSyncSection';
import { PartnerShareSection } from '@/components/PartnerShareSection';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings as SettingsIcon, 
  CalendarPlus, 
  Ruler, 
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  BellOff,
  Smartphone,
  Download,
  FileText,
  FileSpreadsheet,
  LogOut,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [newPeriodDate, setNewPeriodDate] = useState<Date>(new Date());
  const [newPeriodFlow, setNewPeriodFlow] = useState<FlowIntensity>('medium');
  const [cycleLengthDialogOpen, setCycleLengthDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [periodReminder, setPeriodReminder] = useState(true);
  const [fertileReminder, setFertileReminder] = useState(true);
  const [notificationSupported, setNotificationSupported] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const data = getCycleData();
    if (data) {
      setCycleData(data);
      setCycleLength(data.cycleLength);
      setPeriodLength(data.periodLength);
    }
    
    // Load notification settings
    setNotificationSupported('Notification' in window);
    const notifSettings = getNotificationSettings();
    setNotificationsEnabled(notifSettings.enabled);
    setPeriodReminder(notifSettings.periodReminder);
    setFertileReminder(notifSettings.fertileReminder);
  }, []);
  
  const handleSaveCycleSettings = () => {
    if (!cycleData) return;
    
    const updated: CycleData = {
      ...cycleData,
      cycleLength,
      periodLength,
    };
    
    saveCycleData(updated);
    setCycleData(updated);
    setCycleLengthDialogOpen(false);
  };
  
  const handleLogNewPeriod = () => {
    addPeriodLog(format(newPeriodDate, 'yyyy-MM-dd'), newPeriodFlow);
    setCycleData(getCycleData());
    setPeriodDialogOpen(false);
  };
  
  const handleResetData = () => {
    resetAllData();
    navigate('/onboarding');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };
  
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      if (!('Notification' in window)) {
        toast.error('Notifications are not supported in this browser');
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        saveNotificationSettings({
          enabled: true,
          periodReminder,
          fertileReminder,
          lastNotificationDate: null,
        });
        toast.success('Notifications enabled!');
      } else {
        toast.error('Please allow notifications in your browser settings');
      }
    } else {
      setNotificationsEnabled(false);
      saveNotificationSettings({
        enabled: false,
        periodReminder,
        fertileReminder,
        lastNotificationDate: null,
      });
      toast.success('Notifications disabled');
    }
  };
  
  const handlePeriodReminderChange = (enabled: boolean) => {
    setPeriodReminder(enabled);
    saveNotificationSettings({
      enabled: notificationsEnabled,
      periodReminder: enabled,
      fertileReminder,
      lastNotificationDate: null,
    });
  };
  
  const handleFertileReminderChange = (enabled: boolean) => {
    setFertileReminder(enabled);
    saveNotificationSettings({
      enabled: notificationsEnabled,
      periodReminder,
      fertileReminder: enabled,
      lastNotificationDate: null,
    });
  };

  const handleExportCSV = () => {
    if (!cycleData) return;
    downloadCSV(cycleData);
    toast.success('CSV file downloaded!');
  };

  const handleExportPDF = () => {
    if (!cycleData) return;
    downloadPDF(cycleData);
    toast.success('PDF report opened for printing');
  };
  
  const FLOW_OPTIONS: FlowIntensity[] = ['spotting', 'light', 'medium', 'heavy'];
  
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-muted-foreground" />
          Settings
        </h1>
      </header>
      
      {/* Settings List */}
      <div className="px-6 space-y-4">
        {/* Log New Period */}
        <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full bg-card rounded-2xl border border-border p-4 flex items-center justify-between hover:shadow-soft transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-period/10">
                  <CalendarPlus className="w-5 h-5 text-period" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Log New Period</p>
                  <p className="text-sm text-muted-foreground">Record when your period started</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Log New Period</DialogTitle>
              <DialogDescription>
                Select the first day of your period
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Calendar
                mode="single"
                selected={newPeriodDate}
                onSelect={(date) => date && setNewPeriodDate(date)}
                disabled={(date) => date > new Date()}
              />
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Flow Intensity</p>
                <div className="flex flex-wrap gap-2">
                  {FLOW_OPTIONS.map((flow) => (
                    <button
                      key={flow}
                      onClick={() => setNewPeriodFlow(flow)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all border-2',
                        newPeriodFlow === flow
                          ? 'bg-period text-white border-period'
                          : 'bg-card border-border text-foreground'
                      )}
                    >
                      {FLOW_LABELS[flow]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleLogNewPeriod} className="w-full gradient-primary rounded-xl">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Cycle Settings */}
        <Dialog open={cycleLengthDialogOpen} onOpenChange={setCycleLengthDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full bg-card rounded-2xl border border-border p-4 flex items-center justify-between hover:shadow-soft transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Ruler className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Cycle Settings</p>
                  <p className="text-sm text-muted-foreground">
                    {cycleData?.cycleLength} day cycle, {cycleData?.periodLength} day period
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Cycle Settings</DialogTitle>
              <DialogDescription>
                Adjust your average cycle and period length
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Cycle Length</span>
                  <span className="text-sm font-medium text-primary">{cycleLength} days</span>
                </div>
                <Slider
                  value={[cycleLength]}
                  onValueChange={([value]) => setCycleLength(value)}
                  min={21}
                  max={40}
                  step={1}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Period Length</span>
                  <span className="text-sm font-medium text-period">{periodLength} days</span>
                </div>
                <Slider
                  value={[periodLength]}
                  onValueChange={([value]) => setPeriodLength(value)}
                  min={2}
                  max={10}
                  step={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveCycleSettings} className="w-full gradient-primary rounded-xl">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Cloud & Sharing Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Cloud & Sharing</p>
          <CloudSyncSection />
          <PartnerShareSection />
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border my-6" />
        
        {/* Appearance Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Appearance</p>
          
          {/* Theme Toggle */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'system' ? 'System' : theme === 'dark' ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            
            {/* Theme buttons */}
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                    theme === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border my-6" />
        
        {/* Notifications Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Notifications</p>
          
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            {/* Main notification toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  {notificationsEnabled ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {notificationSupported ? 'Get reminders for your cycle' : 'Not supported'}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
                disabled={!notificationSupported}
              />
            </div>
            
            {/* Sub-settings */}
            {notificationsEnabled && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Period reminders</span>
                  </div>
                  <Switch
                    checked={periodReminder}
                    onCheckedChange={handlePeriodReminderChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Fertile window alerts</span>
                  </div>
                  <Switch
                    checked={fertileReminder}
                    onCheckedChange={handleFertileReminderChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border my-6" />
        
        {/* Data Export Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Data Export</p>
          
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Share your cycle history with healthcare providers
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex-1 rounded-xl"
                disabled={!cycleData}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="flex-1 rounded-xl"
                disabled={!cycleData}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Account Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Account</p>
          
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center justify-between hover:shadow-soft transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted">
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Sign Out</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center justify-between hover:shadow-soft transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <LogIn className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Sign In</p>
                  <p className="text-sm text-muted-foreground">Enable cloud backup & sharing</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Danger Zone */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full bg-card rounded-2xl border border-destructive/20 p-4 flex items-center justify-between hover:bg-destructive/5 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-destructive">Reset All Data</p>
                  <p className="text-sm text-muted-foreground">Delete all your cycle data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/50" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your cycle data from this device. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetData}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <BottomNav />
    </div>
  );
}
