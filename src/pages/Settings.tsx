import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getCycleData, saveCycleData, resetAllData, addPeriodLog } from '@/lib/storage';
import { CycleData, FlowIntensity, FLOW_LABELS } from '@/types/cycle';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [newPeriodDate, setNewPeriodDate] = useState<Date>(new Date());
  const [newPeriodFlow, setNewPeriodFlow] = useState<FlowIntensity>('medium');
  const [cycleLengthDialogOpen, setCycleLengthDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  
  useEffect(() => {
    const data = getCycleData();
    if (data) {
      setCycleData(data);
      setCycleLength(data.cycleLength);
      setPeriodLength(data.periodLength);
    }
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
  
  const FLOW_OPTIONS: FlowIntensity[] = ['spotting', 'light', 'medium', 'heavy'];
  
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
        
        {/* Reset Data */}
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
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your cycle data, including logged periods, symptoms, and settings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetData}
                className="bg-destructive text-destructive-foreground rounded-xl"
              >
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* App Info */}
      <div className="px-6 mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-sm">Bloom v1.0</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Made with care for your well-being
        </p>
      </div>
      
      <BottomNav />
    </div>
  );
}
