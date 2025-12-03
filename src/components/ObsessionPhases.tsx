import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import type { ObsessionPhase } from '@/types/insights';

interface ObsessionPhasesProps {
  phases: ObsessionPhase[];
}

export function ObsessionPhases({ phases }: ObsessionPhasesProps) {
  const displayPhases = useMemo(() => phases.slice(0, 8), [phases]);

  if (displayPhases.length === 0) {
    return null;
  }

  const formatWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getIntensityColor = (percent: number) => {
    if (percent > 70) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (percent > 50) return 'bg-primary/20 text-primary border-primary/30';
    return 'bg-secondary text-secondary-foreground border-secondary';
  };

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Obsession Phases</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Weeks where you discovered an artist and couldn't stop playing them
        </p>

        <div className="space-y-3">
          {displayPhases.map((phase, index) => (
            <div
              key={`${phase.weekStart}-${phase.artist}`}
              className="flex items-center gap-4 p-4 bg-card/30 border border-border/50 rounded-lg hover:bg-card/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-32 flex-shrink-0">
                <p className="text-sm text-muted-foreground">Week of</p>
                <p className="text-foreground font-medium">{formatWeek(phase.weekStart)}</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">{phase.artist}</p>
                <p className="text-sm text-muted-foreground">
                  {phase.plays} plays that week
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getIntensityColor(phase.percentOfWeek)}`}>
                {phase.percentOfWeek}% of week
              </div>
            </div>
          ))}
        </div>

        {phases.length > 8 && (
          <p className="text-center text-muted-foreground text-sm mt-6">
            + {phases.length - 8} more obsession phases
          </p>
        )}
      </div>
    </section>
  );
}
