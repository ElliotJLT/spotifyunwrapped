import { useState, useMemo, useCallback } from 'react';
import { Calendar, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimeCapsules } from '@/lib/insightsParser';

interface TimeCapsulesProps {
  jsonFiles: string[];
}

export function TimeCapsules({ jsonFiles }: TimeCapsulesProps) {
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  const capsules = useMemo(() => {
    return getTimeCapsules(jsonFiles, targetDate);
  }, [jsonFiles, targetDate]);

  const getRandomDate = useCallback(() => {
    // Pick a random date from the past 10 years
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 3650); // ~10 years
    const randomDate = new Date(now);
    randomDate.setDate(randomDate.getDate() - randomDays);
    setTargetDate(randomDate);
  }, []);

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Time Capsules</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          What were you listening to on this day in past years?
        </p>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-card/50 border border-border/50 rounded-lg px-4 py-2">
            <span className="text-foreground font-medium">{formatDateDisplay(targetDate)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={getRandomDate}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Random Day
          </Button>
        </div>

        {capsules.length === 0 ? (
          <div className="text-center py-12 bg-card/30 border border-border/50 rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No listening data found for {formatDateDisplay(targetDate)}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try a different date or click "Random Day"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {capsules.map((capsule) => (
              <div
                key={capsule.year}
                className="bg-card/50 border border-border/50 rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-display text-primary">{capsule.year}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-sm">
                    {capsule.tracks.length} track{capsule.tracks.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                <div className="space-y-2">
                  {capsule.tracks.map((track, i) => (
                    <div
                      key={`${track.track}-${i}`}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate">{track.track}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">{track.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
