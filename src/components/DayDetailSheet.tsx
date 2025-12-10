import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DayStatus, 
  Symptom, 
  FlowIntensity, 
  SYMPTOM_LABELS, 
  FLOW_LABELS,
  DayLog
} from '@/types/cycle';
import { updateDayLog } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Droplets, Check } from 'lucide-react';

interface DayDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  status: DayStatus | null;
  onUpdate: () => void;
}

const SYMPTOMS: Symptom[] = [
  'cramps', 'headache', 'bloating', 'fatigue', 'mood_swings',
  'breast_tenderness', 'acne', 'backache', 'nausea', 'cravings'
];

const FLOW_OPTIONS: FlowIntensity[] = ['spotting', 'light', 'medium', 'heavy'];

export function DayDetailSheet({ 
  open, 
  onOpenChange, 
  date, 
  status,
  onUpdate 
}: DayDetailSheetProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>();
  
  useEffect(() => {
    if (status?.dayLog) {
      setSelectedSymptoms(status.dayLog.symptoms);
      setSelectedFlow(status.dayLog.flowIntensity);
    } else {
      setSelectedSymptoms([]);
      setSelectedFlow(undefined);
    }
  }, [status]);
  
  const toggleSymptom = (symptom: Symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const handleSave = () => {
    if (!date) return;
    
    const log: DayLog = {
      date: format(date, 'yyyy-MM-dd'),
      symptoms: selectedSymptoms,
      flowIntensity: selectedFlow,
    };
    
    updateDayLog(log);
    onUpdate();
    onOpenChange(false);
  };
  
  if (!date || !status) return null;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="font-serif text-2xl">
            {format(date, 'EEEE, MMMM d')}
          </SheetTitle>
          <SheetDescription className="flex gap-2">
            {status.isPeriod && (
              <Badge variant="secondary" className="bg-period/20 text-period border-0">
                Period Day
              </Badge>
            )}
            {status.isFertile && !status.isPeriod && (
              <Badge variant="secondary" className="bg-fertile/20 text-fertile border-0">
                Fertile Window
              </Badge>
            )}
            {status.isOvulation && (
              <Badge variant="secondary" className="bg-ovulation/30 text-accent border-0">
                Ovulation Day
              </Badge>
            )}
            {status.isSafe && !status.isPeriod && (
              <Badge variant="secondary" className="bg-safe/20 text-safe border-0">
                Safe Day
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>
        
        {/* Flow Intensity */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Droplets className="w-4 h-4 text-period" />
            Flow Intensity
          </h4>
          <div className="flex flex-wrap gap-2">
            {FLOW_OPTIONS.map((flow) => (
              <button
                key={flow}
                onClick={() => setSelectedFlow(selectedFlow === flow ? undefined : flow)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  'border-2',
                  selectedFlow === flow
                    ? 'bg-period text-white border-period'
                    : 'bg-card border-border text-foreground hover:border-period/50'
                )}
              >
                {FLOW_LABELS[flow]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptoms */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-foreground">Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  'px-3 py-2 rounded-full text-sm font-medium transition-all',
                  'border-2 flex items-center gap-1.5',
                  selectedSymptoms.includes(symptom)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-foreground hover:border-primary/50'
                )}
              >
                {selectedSymptoms.includes(symptom) && (
                  <Check className="w-3 h-3" />
                )}
                {SYMPTOM_LABELS[symptom]}
              </button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          className="w-full rounded-xl h-12 text-base font-medium gradient-primary"
        >
          Save
        </Button>
      </SheetContent>
    </Sheet>
  );
}
