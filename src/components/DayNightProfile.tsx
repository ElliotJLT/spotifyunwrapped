import { HourlyProfile } from '@/types/spotify';
import { useMemo } from 'react';

interface DayNightProfileProps {
  data: HourlyProfile[];
}

export function DayNightProfile({ data }: DayNightProfileProps) {
  const heatmapData = useMemo(() => {
    // Get unique artists and hours
    const artists = [...new Set(data.map(d => d.artist))].slice(0, 10);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Create matrix
    const matrix = artists.map(artist => {
      const artistData = data.filter(d => d.artist === artist);
      const hourlyMinutes = hours.map(hour => {
        const hourData = artistData.find(d => d.hour === hour);
        return hourData?.minutes || 0;
      });
      const maxMinutes = Math.max(...hourlyMinutes, 1);
      return {
        artist,
        hours: hourlyMinutes.map(m => m / maxMinutes), // Normalize to 0-1
        rawHours: hourlyMinutes,
      };
    });

    return { matrix, hours };
  }, [data]);

  if (!data.length) return null;

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Day & Night Profile
          </h2>
          <p className="text-muted-foreground">
            When you listen to your favorite artists
          </p>
        </div>

        <div className="card-elevated p-6 overflow-x-auto animate-fade-up stagger-1">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2 ml-32">
              {heatmapData.hours.filter((_, i) => i % 3 === 0).map(hour => (
                <div
                  key={hour}
                  className="flex-1 text-xs text-muted-foreground text-center"
                  style={{ minWidth: '36px' }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            <div className="space-y-1">
              {heatmapData.matrix.map(({ artist, hours, rawHours }) => (
                <div key={artist} className="flex items-center gap-2">
                  <div className="w-28 text-sm text-foreground truncate text-right pr-2">
                    {artist}
                  </div>
                  <div className="flex flex-1 gap-0.5">
                    {hours.map((intensity, hour) => (
                      <div
                        key={hour}
                        className="flex-1 h-6 rounded-sm transition-all hover:scale-110"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${intensity * 0.8 + 0.1})`,
                          minWidth: '12px',
                        }}
                        title={`${artist} at ${formatHour(hour)}: ${Math.round(rawHours[hour])} min`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map(intensity => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--primary) / ${intensity})` }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
