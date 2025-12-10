import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { saveCycleData } from '@/lib/storage';
import { CycleData } from '@/types/cycle';
import { Heart, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'welcome' | 'lastPeriod' | 'cycleLength' | 'periodLength';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>(subDays(new Date(), 14));
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  
  const handleComplete = () => {
    const cycleData: CycleData = {
      lastPeriodStart: format(lastPeriodDate, 'yyyy-MM-dd'),
      cycleLength,
      periodLength,
      periodLogs: [{
        startDate: format(lastPeriodDate, 'yyyy-MM-dd'),
        flowIntensity: 'medium',
      }],
      dayLogs: [],
    };
    
    saveCycleData(cycleData);
    navigate('/');
  };
  
  const steps: Step[] = ['welcome', 'lastPeriod', 'cycleLength', 'periodLength'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
          <div 
            className="h-full gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center animate-fade-in max-w-sm">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-soft">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">
              Bloom
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your personal cycle companion. Track your menstrual cycle, understand your fertile windows, and stay informed.
            </p>
            <Button 
              onClick={() => setStep('lastPeriod')}
              className="w-full h-14 rounded-2xl text-base font-medium gradient-primary shadow-soft"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Last Period Step */}
        {step === 'lastPeriod' && (
          <div className="w-full max-w-sm animate-fade-in">
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              When did your last period start?
            </h2>
            <p className="text-muted-foreground mb-6">
              Select the first day of your most recent period.
            </p>
            
            <div className="bg-card rounded-3xl p-4 shadow-card mb-6">
              <Calendar
                mode="single"
                selected={lastPeriodDate}
                onSelect={(date) => date && setLastPeriodDate(date)}
                disabled={(date) => date > new Date()}
                className="pointer-events-auto"
              />
            </div>
            
            <div className="bg-secondary/50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-foreground">
                <span className="font-medium">Selected: </span>
                {format(lastPeriodDate, 'MMMM d, yyyy')}
              </p>
            </div>
            
            <Button 
              onClick={() => setStep('cycleLength')}
              className="w-full h-14 rounded-2xl text-base font-medium gradient-primary shadow-soft"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Cycle Length Step */}
        {step === 'cycleLength' && (
          <div className="w-full max-w-sm animate-fade-in">
            <button
              onClick={() => setStep('lastPeriod')}
              className="flex items-center text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              How long is your cycle?
            </h2>
            <p className="text-muted-foreground mb-8">
              The average cycle is 28 days, but it can range from 21 to 35 days.
            </p>
            
            <div className="text-center mb-8">
              <span className="text-6xl font-serif font-semibold text-primary">
                {cycleLength}
              </span>
              <span className="text-xl text-muted-foreground ml-2">days</span>
            </div>
            
            <div className="px-2 mb-8">
              <Slider
                value={[cycleLength]}
                onValueChange={([value]) => setCycleLength(value)}
                min={21}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>21 days</span>
                <span>40 days</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('periodLength')}
              className="w-full h-14 rounded-2xl text-base font-medium gradient-primary shadow-soft"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Period Length Step */}
        {step === 'periodLength' && (
          <div className="w-full max-w-sm animate-fade-in">
            <button
              onClick={() => setStep('cycleLength')}
              className="flex items-center text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              How long does your period last?
            </h2>
            <p className="text-muted-foreground mb-8">
              Most periods last between 3 to 7 days.
            </p>
            
            <div className="text-center mb-8">
              <span className="text-6xl font-serif font-semibold text-period">
                {periodLength}
              </span>
              <span className="text-xl text-muted-foreground ml-2">days</span>
            </div>
            
            <div className="px-2 mb-8">
              <Slider
                value={[periodLength]}
                onValueChange={([value]) => setPeriodLength(value)}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2 days</span>
                <span>10 days</span>
              </div>
            </div>
            
            <Button 
              onClick={handleComplete}
              className="w-full h-14 rounded-2xl text-base font-medium gradient-primary shadow-soft"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Tracking
            </Button>
          </div>
        )}
      </div>
      
      {/* Step indicators */}
      {step !== 'welcome' && (
        <div className="flex justify-center gap-2 pb-8">
          {['lastPeriod', 'cycleLength', 'periodLength'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                steps.indexOf(step) > i ? 'bg-primary' : 
                step === s ? 'bg-primary w-6' : 'bg-muted'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
