import { useMemo } from 'react';
import { parseCSV } from '@/lib/csvParser';
import { DailySummary, TopArtist, HourlyProfile, Session } from '@/types/spotify';
import { HeroStats } from './HeroStats';
import { ListeningTimeline } from './ListeningTimeline';
import { MusicEras } from './MusicEras';
import { DayNightProfile } from './DayNightProfile';
import { SessionInsights } from './SessionInsights';
import { ArtistLoyalty } from './ArtistLoyalty';
import { WeeklyRhythm } from './WeeklyRhythm';
import { Music2 } from 'lucide-react';

interface DashboardProps {
  files: Record<string, string>;
}

export function Dashboard({ files }: DashboardProps) {
  const data = useMemo(() => {
    const dailySummary = files.daily_summary 
      ? parseCSV<DailySummary>(files.daily_summary) 
      : [];
    
    const topArtists = files.top_artists 
      ? parseCSV<TopArtist>(files.top_artists) 
      : [];
    
    const hourlyProfile = files.hourly_profile 
      ? parseCSV<HourlyProfile>(files.hourly_profile) 
      : [];
    
    const sessions = files.sessions 
      ? parseCSV<Session>(files.sessions) 
      : [];

    // Calculate hero stats
    const totalMinutes = dailySummary.reduce((sum, d) => sum + (d.minutes_listened || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    const uniqueArtists = topArtists.length || 
      new Set(dailySummary.map(d => d.unique_artists)).size;
    const totalTracks = dailySummary.reduce((sum, d) => sum + (d.tracks_played || 0), 0);
    const longestSession = sessions.length > 0 
      ? Math.max(...sessions.map(s => s.duration_minutes || 0))
      : 0;
    const averageDaily = dailySummary.length > 0 
      ? Math.round(totalMinutes / dailySummary.length)
      : 0;

    return {
      dailySummary,
      topArtists,
      hourlyProfile,
      sessions,
      heroStats: {
        totalHours,
        uniqueArtists,
        longestSession,
        totalTracks,
        averageDaily,
      },
    };
  }, [files]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-lg text-foreground">Music Diary</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload New Data
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <HeroStats {...data.heroStats} />

      {/* Listening Timeline */}
      {data.dailySummary.length > 0 && (
        <ListeningTimeline data={data.dailySummary} />
      )}

      {/* Music Eras / Top Artists */}
      {data.topArtists.length > 0 && (
        <MusicEras artists={data.topArtists} />
      )}

      {/* Day/Night Profile */}
      {data.hourlyProfile.length > 0 && (
        <DayNightProfile data={data.hourlyProfile} />
      )}

      {/* Session Insights */}
      {data.sessions.length > 0 && (
        <SessionInsights sessions={data.sessions} />
      )}

      {/* Artist Loyalty */}
      {data.topArtists.length > 0 && (
        <ArtistLoyalty artists={data.topArtists} />
      )}

      {/* Weekly Rhythm */}
      {data.dailySummary.length > 0 && (
        <WeeklyRhythm data={data.dailySummary} />
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Your personal music diary • Data stays local
          </p>
        </div>
      </footer>
    </div>
  );
}
