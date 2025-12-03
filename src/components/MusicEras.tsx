import { TopArtist } from '@/types/spotify';
import { useMemo } from 'react';
import { formatNumber } from '@/lib/csvParser';

interface MusicErasProps {
  artists: TopArtist[];
}

interface YearData {
  year: number;
  topArtists: string[];
  totalHours: number;
}

export function MusicEras({ artists }: MusicErasProps) {
  const yearlyData = useMemo(() => {
    // Group by year and get top 3 artists per year
    const byYear = new Map<number, { artist: string; minutes: number }[]>();

    artists.forEach(a => {
      const year = a.year || new Date().getFullYear();
      if (!byYear.has(year)) {
        byYear.set(year, []);
      }
      byYear.get(year)!.push({ artist: a.artist, minutes: a.total_minutes });
    });

    const result: YearData[] = [];

    byYear.forEach((yearArtists, year) => {
      const sorted = yearArtists.sort((a, b) => b.minutes - a.minutes);
      const totalMinutes = sorted.reduce((sum, a) => sum + a.minutes, 0);
      
      result.push({
        year,
        topArtists: sorted.slice(0, 3).map(a => a.artist),
        totalHours: Math.round(totalMinutes / 60),
      });
    });

    return result.sort((a, b) => a.year - b.year);
  }, [artists]);

  if (!yearlyData.length) return null;

  // If no year data, show overall top artists
  if (yearlyData.length === 1 && !artists[0]?.year) {
    const topThree = [...artists]
      .sort((a, b) => b.total_minutes - a.total_minutes)
      .slice(0, 5);

    return (
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8 animate-fade-up">
            <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
              Your Top Artists
            </h2>
            <p className="text-muted-foreground">
              The artists that defined your listening
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topThree.map((artist, index) => (
              <div
                key={artist.artist}
                className={`card-elevated p-6 animate-fade-up opacity-0 stagger-${index + 1}`}
              >
                <div className="text-4xl font-display text-primary mb-2">
                  #{index + 1}
                </div>
                <h3 className="text-lg font-medium text-foreground truncate">
                  {artist.artist}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatNumber(Math.round(artist.total_minutes / 60))} hours
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Your Music Eras
          </h2>
          <p className="text-muted-foreground">
            How your taste evolved through the years
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-border hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {yearlyData.map((year, index) => (
              <div
                key={year.year}
                className={`relative animate-fade-up opacity-0 stagger-${(index % 5) + 1}`}
              >
                {/* Timeline dot */}
                <div className="hidden md:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />

                <div className="card-elevated p-6 mt-6">
                  <div className="text-3xl font-display text-primary mb-4">
                    {year.year}
                  </div>
                  <div className="space-y-2 mb-4">
                    {year.topArtists.map((artist, i) => (
                      <div key={artist} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">
                          {i + 1}.
                        </span>
                        <span className="text-sm text-foreground truncate">
                          {artist}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(year.totalHours)} hours total
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
