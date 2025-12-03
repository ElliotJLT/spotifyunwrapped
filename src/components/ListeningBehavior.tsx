import { useMemo } from 'react';
import { SkipForward, CheckCircle, XCircle } from 'lucide-react';
import type { ArtistBehavior } from '@/types/insights';

interface ListeningBehaviorProps {
  behaviors: ArtistBehavior[];
  overallSkipRate: number;
  overallCompletionRate: number;
}

export function ListeningBehavior({ behaviors, overallSkipRate, overallCompletionRate }: ListeningBehaviorProps) {
  const { mostSkipped, leastSkipped, mostCompleted } = useMemo(() => {
    const sorted = [...behaviors].filter((b) => b.totalPlays >= 20);
    
    const mostSkipped = [...sorted]
      .sort((a, b) => b.skipRate - a.skipRate)
      .slice(0, 5);
    
    const leastSkipped = [...sorted]
      .filter((b) => b.skipRate < 10)
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 5);
    
    const mostCompleted = [...sorted]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    return { mostSkipped, leastSkipped, mostCompleted };
  }, [behaviors]);

  if (behaviors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <SkipForward className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Listening Behavior</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          How you actually interact with your music
        </p>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <p className="text-muted-foreground text-sm mb-1">Overall Skip Rate</p>
            <p className="text-3xl font-display text-foreground">{overallSkipRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overallSkipRate < 20 ? 'You let songs play!' : overallSkipRate < 40 ? 'Average skipper' : 'Picky listener'}
            </p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <p className="text-muted-foreground text-sm mb-1">Avg Completion</p>
            <p className="text-3xl font-display text-foreground">{overallCompletionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overallCompletionRate > 80 ? 'Full song listener' : overallCompletionRate > 50 ? 'Sometimes impatient' : 'Quick sampler'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Skipped */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-4 h-4 text-destructive" />
              <h3 className="text-foreground font-medium">Most Skipped</h3>
            </div>
            <div className="space-y-3">
              {mostSkipped.map((artist) => (
                <div key={artist.artist} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80 truncate">{artist.artist}</span>
                  <span className="text-sm text-destructive font-medium">{artist.skipRate}%</span>
                </div>
              ))}
              {mostSkipped.length === 0 && (
                <p className="text-sm text-muted-foreground">No significant skippers</p>
              )}
            </div>
          </div>

          {/* Least Skipped */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h3 className="text-foreground font-medium">Never Skip</h3>
            </div>
            <div className="space-y-3">
              {leastSkipped.map((artist) => (
                <div key={artist.artist} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80 truncate">{artist.artist}</span>
                  <span className="text-sm text-green-500 font-medium">{artist.skipRate}%</span>
                </div>
              ))}
              {leastSkipped.length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>

          {/* Most Completed */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-primary" />
              <h3 className="text-foreground font-medium">Full Plays</h3>
            </div>
            <div className="space-y-3">
              {mostCompleted.map((artist) => (
                <div key={artist.artist} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80 truncate">{artist.artist}</span>
                  <span className="text-sm text-primary font-medium">{artist.completionRate}%</span>
                </div>
              ))}
              {mostCompleted.length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
