import { useMemo } from 'react';
import { Ghost } from 'lucide-react';
import type { ForgottenArtist } from '@/types/insights';

interface ForgottenFavoritesProps {
  artists: ForgottenArtist[];
}

export function ForgottenFavorites({ artists }: ForgottenFavoritesProps) {
  const displayArtists = useMemo(() => artists.slice(0, 6), [artists]);

  if (displayArtists.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const formatHours = (minutes: number) => {
    const hours = Math.round(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Ghost className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Forgotten Favorites</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Artists you used to love but haven't played in over a year
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayArtists.map((artist, index) => (
            <div
              key={artist.artist}
              className="group relative bg-card/50 border border-border/50 rounded-xl p-5 hover:bg-card/80 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-3 right-3 text-xs text-muted-foreground/50">
                #{index + 1}
              </div>
              
              <h3 className="font-medium text-foreground text-lg mb-3 pr-8 truncate">
                {artist.artist}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Year</span>
                  <span className="text-foreground font-medium">{artist.peakYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Listening</span>
                  <span className="text-primary font-medium">{formatHours(artist.peakMinutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Played</span>
                  <span className="text-foreground/70">{formatDate(artist.lastPlayed)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic">
                  {artist.totalPlays} total plays, then silence...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
