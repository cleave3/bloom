import { Mood, MOOD_EMOJIS, MOOD_LABELS } from '@/types/cycle';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  selectedMood: Mood | undefined;
  onSelect: (mood: Mood | undefined) => void;
}

const MOODS: Mood[] = ['great', 'good', 'okay', 'bad', 'awful'];

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex justify-between gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood}
          onClick={() => onSelect(selectedMood === mood ? undefined : mood)}
          className={cn(
            'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all',
            'border-2',
            selectedMood === mood
              ? 'bg-primary/10 border-primary'
              : 'bg-card border-border hover:border-primary/50'
          )}
        >
          <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
          <span className={cn(
            'text-xs font-medium',
            selectedMood === mood ? 'text-primary' : 'text-muted-foreground'
          )}>
            {MOOD_LABELS[mood]}
          </span>
        </button>
      ))}
    </div>
  );
}
