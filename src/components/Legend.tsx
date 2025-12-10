export function Legend() {
  const items = [
    { color: 'bg-period', label: 'Period' },
    { color: 'bg-fertile/50', label: 'Fertile' },
    { color: 'bg-ovulation', label: 'Ovulation' },
    { color: 'bg-safe/40', label: 'Safe' },
  ];
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-muted/30 rounded-2xl">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
