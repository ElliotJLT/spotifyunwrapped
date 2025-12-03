import { useMemo } from 'react';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import type { TimePeriodProfile } from '@/types/insights';

interface LateNightConfessionsProps {
  profiles: TimePeriodProfile[];
}

const periodConfig = {
  lateNight: {
    icon: Moon,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    accent: 'text-indigo-400',
  },
  morning: {
    icon: Sunrise,
    gradient: 'from-amber-500/20 to-orange-500/20',
    accent: 'text-amber-400',
  },
  afternoon: {
    icon: Sun,
    gradient: 'from-yellow-500/20 to-orange-500/20',
    accent: 'text-yellow-400',
  },
  evening: {
    icon: Sunset,
    gradient: 'from-rose-500/20 to-purple-500/20',
    accent: 'text-rose-400',
  },
};

export function LateNightConfessions({ profiles }: LateNightConfessionsProps) {
  const lateNightProfile = useMemo(
    () => profiles.find((p) => p.period === 'lateNight'),
    [profiles]
  );

  const afternoonProfile = useMemo(
    () => profiles.find((p) => p.period === 'afternoon'),
    [profiles]
  );

  // Find artists unique to late night
  const lateNightOnly = useMemo(() => {
    if (!lateNightProfile || !afternoonProfile) return [];
    
    const afternoonArtists = new Set(afternoonProfile.artists.map((a) => a.artist));
    return lateNightProfile.artists.filter((a) => !afternoonArtists.has(a.artist));
  }, [lateNightProfile, afternoonProfile]);

  if (profiles.length === 0) {
    return null;
  }

  const formatHours = (minutes: number) => {
    const hours = Math.round(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Moon className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Late Night Confessions</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Your music taste changes with the clock
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {profiles.map((profile) => {
            const config = periodConfig[profile.period];
            const Icon = config.icon;

            return (
              <div
                key={profile.period}
                className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${config.gradient} border border-border/50`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-4 h-4 ${config.accent}`} />
                  <span className="text-sm text-muted-foreground">{profile.label}</span>
                </div>

                <div className="space-y-2">
                  {profile.artists.slice(0, 3).map((artist, i) => (
                    <div key={artist.artist} className="flex items-center justify-between">
                      <span className={`text-sm truncate ${i === 0 ? 'text-foreground font-medium' : 'text-foreground/70'}`}>
                        {artist.artist}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatHours(artist.minutes)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Total: {formatHours(profile.totalMinutes)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {lateNightOnly.length > 0 && (
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h3 className="text-foreground font-medium mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              Your 2am-Only Artists
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These artists only appear in your late night listening
            </p>
            <div className="flex flex-wrap gap-2">
              {lateNightOnly.map((artist) => (
                <span
                  key={artist.artist}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-sm border border-indigo-500/20"
                >
                  {artist.artist}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
