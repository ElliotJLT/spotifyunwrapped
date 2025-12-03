import type {
  ForgottenArtist,
  ObsessionPhase,
  TimePeriodProfile,
  ArtistBehavior,
  ShuffleStats,
  InsightsData,
} from '@/types/insights';

interface SpotifyStreamingEntry {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  shuffle: boolean;
  skipped: boolean;
}

export function generateInsightsData(jsonFiles: string[]): InsightsData {
  const allEntries: SpotifyStreamingEntry[] = [];

  for (const jsonText of jsonFiles) {
    try {
      const entries = JSON.parse(jsonText) as SpotifyStreamingEntry[];
      allEntries.push(...entries);
    } catch (e) {
      console.error('Failed to parse JSON file:', e);
    }
  }

  const musicEntries = allEntries.filter(
    (entry) => entry.master_metadata_track_name && entry.master_metadata_album_artist_name
  );

  musicEntries.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  return {
    forgottenArtists: generateForgottenArtists(musicEntries),
    obsessionPhases: generateObsessionPhases(musicEntries),
    timePeriodProfiles: generateTimePeriodProfiles(musicEntries),
    artistBehaviors: generateArtistBehaviors(musicEntries),
    shuffleStats: generateShuffleStats(musicEntries),
    ...generateOverallStats(musicEntries),
  };
}

function generateForgottenArtists(entries: SpotifyStreamingEntry[]): ForgottenArtist[] {
  if (entries.length === 0) return [];

  const artistYearData = new Map<string, Map<number, number>>();
  const artistLastPlayed = new Map<string, string>();
  const artistTotalPlays = new Map<string, number>();

  for (const entry of entries) {
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    const year = new Date(entry.ts).getFullYear();
    const minutes = entry.ms_played / 60000;

    if (!artistYearData.has(artist)) {
      artistYearData.set(artist, new Map());
    }
    const yearMap = artistYearData.get(artist)!;
    yearMap.set(year, (yearMap.get(year) || 0) + minutes);

    artistLastPlayed.set(artist, entry.ts);
    artistTotalPlays.set(artist, (artistTotalPlays.get(artist) || 0) + 1);
  }

  const lastEntryDate = new Date(entries[entries.length - 1].ts);
  const cutoffDate = new Date(lastEntryDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - 12);

  const forgotten: ForgottenArtist[] = [];

  for (const [artist, yearMap] of artistYearData.entries()) {
    const lastPlayed = new Date(artistLastPlayed.get(artist)!);
    
    // Only consider artists not played in the last 12 months of data
    if (lastPlayed > cutoffDate) continue;

    // Find peak year
    let peakYear = 0;
    let peakMinutes = 0;
    for (const [year, minutes] of yearMap.entries()) {
      if (minutes > peakMinutes) {
        peakYear = year;
        peakMinutes = minutes;
      }
    }

    // Only include artists with significant listening (>60 min in peak year)
    if (peakMinutes < 60) continue;

    forgotten.push({
      artist,
      peakYear,
      peakMinutes: Math.round(peakMinutes),
      lastPlayed: artistLastPlayed.get(artist)!,
      totalPlays: artistTotalPlays.get(artist) || 0,
    });
  }

  return forgotten.sort((a, b) => b.peakMinutes - a.peakMinutes).slice(0, 10);
}

function generateObsessionPhases(entries: SpotifyStreamingEntry[]): ObsessionPhase[] {
  if (entries.length === 0) return [];

  // Group plays by week
  const weeklyPlays = new Map<string, Map<string, number>>();

  for (const entry of entries) {
    const date = new Date(entry.ts);
    const weekStart = getWeekStart(date);
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    if (!weeklyPlays.has(weekStart)) {
      weeklyPlays.set(weekStart, new Map());
    }
    const artistMap = weeklyPlays.get(weekStart)!;
    artistMap.set(artist, (artistMap.get(artist) || 0) + 1);
  }

  const phases: ObsessionPhase[] = [];

  for (const [weekStart, artistMap] of weeklyPlays.entries()) {
    const totalPlays = Array.from(artistMap.values()).reduce((a, b) => a + b, 0);
    
    for (const [artist, plays] of artistMap.entries()) {
      const percentOfWeek = (plays / totalPlays) * 100;
      
      // Only include if artist had >30% of weekly plays and >15 plays
      if (percentOfWeek > 30 && plays > 15) {
        phases.push({
          weekStart,
          artist,
          plays,
          percentOfWeek: Math.round(percentOfWeek),
        });
      }
    }
  }

  return phases.sort((a, b) => b.plays - a.plays).slice(0, 20);
}

function generateTimePeriodProfiles(entries: SpotifyStreamingEntry[]): TimePeriodProfile[] {
  const periodData: Record<string, Map<string, number>> = {
    lateNight: new Map(),
    morning: new Map(),
    afternoon: new Map(),
    evening: new Map(),
  };

  for (const entry of entries) {
    const hour = new Date(entry.ts).getHours();
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    const minutes = entry.ms_played / 60000;
    let period: string;

    if (hour >= 0 && hour < 5) {
      period = 'lateNight';
    } else if (hour >= 5 && hour < 12) {
      period = 'morning';
    } else if (hour >= 12 && hour < 18) {
      period = 'afternoon';
    } else {
      period = 'evening';
    }

    const artistMap = periodData[period];
    artistMap.set(artist, (artistMap.get(artist) || 0) + minutes);
  }

  const labels: Record<string, string> = {
    lateNight: '12am - 5am',
    morning: '5am - 12pm',
    afternoon: '12pm - 6pm',
    evening: '6pm - 12am',
  };

  return Object.entries(periodData).map(([period, artistMap]) => {
    const sortedArtists = Array.from(artistMap.entries())
      .map(([artist, minutes]) => ({ artist, minutes: Math.round(minutes) }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    const totalMinutes = Array.from(artistMap.values()).reduce((a, b) => a + b, 0);

    return {
      period: period as TimePeriodProfile['period'],
      label: labels[period],
      artists: sortedArtists,
      totalMinutes: Math.round(totalMinutes),
    };
  });
}

function generateArtistBehaviors(entries: SpotifyStreamingEntry[]): ArtistBehavior[] {
  const artistData = new Map<string, { skipped: number; completed: number; totalMs: number; plays: number }>();

  for (const entry of entries) {
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    const existing = artistData.get(artist) || { skipped: 0, completed: 0, totalMs: 0, plays: 0 };
    
    existing.plays += 1;
    if (entry.skipped) {
      existing.skipped += 1;
    }
    // Consider a track "completed" if played for more than 30 seconds
    if (entry.ms_played > 30000) {
      existing.completed += 1;
    }
    existing.totalMs += entry.ms_played;

    artistData.set(artist, existing);
  }

  const behaviors: ArtistBehavior[] = [];

  for (const [artist, data] of artistData.entries()) {
    if (data.plays < 10) continue; // Only include artists with enough data

    const avgMs = data.totalMs / data.plays;
    // Estimate completion rate based on avg play time vs typical track (3.5 min)
    const completionRate = Math.min(100, (avgMs / 210000) * 100);

    behaviors.push({
      artist,
      skipRate: Math.round((data.skipped / data.plays) * 100),
      completionRate: Math.round(completionRate),
      totalPlays: data.plays,
    });
  }

  return behaviors.sort((a, b) => b.totalPlays - a.totalPlays).slice(0, 50);
}

function generateShuffleStats(entries: SpotifyStreamingEntry[]): ShuffleStats[] {
  const yearData = new Map<number, { shuffle: number; intentional: number }>();

  for (const entry of entries) {
    const year = new Date(entry.ts).getFullYear();
    const existing = yearData.get(year) || { shuffle: 0, intentional: 0 };

    if (entry.shuffle) {
      existing.shuffle += 1;
    } else {
      existing.intentional += 1;
    }

    yearData.set(year, existing);
  }

  return Array.from(yearData.entries())
    .map(([year, data]) => ({
      year,
      shufflePlays: data.shuffle,
      intentionalPlays: data.intentional,
      shufflePercent: Math.round((data.shuffle / (data.shuffle + data.intentional)) * 100),
    }))
    .sort((a, b) => a.year - b.year);
}

function generateOverallStats(entries: SpotifyStreamingEntry[]) {
  let shuffleCount = 0;
  let skipCount = 0;
  let totalMs = 0;

  for (const entry of entries) {
    if (entry.shuffle) shuffleCount++;
    if (entry.skipped) skipCount++;
    totalMs += entry.ms_played;
  }

  const total = entries.length || 1;
  const avgMs = totalMs / total;

  return {
    overallShufflePercent: Math.round((shuffleCount / total) * 100),
    overallSkipRate: Math.round((skipCount / total) * 100),
    overallCompletionRate: Math.round(Math.min(100, (avgMs / 210000) * 100)),
  };
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function getTimeCapsules(jsonFiles: string[], targetDate: Date): { date: string; year: number; tracks: { artist: string; track: string; time: string }[] }[] {
  const allEntries: SpotifyStreamingEntry[] = [];

  for (const jsonText of jsonFiles) {
    try {
      const entries = JSON.parse(jsonText) as SpotifyStreamingEntry[];
      allEntries.push(...entries);
    } catch (e) {
      console.error('Failed to parse JSON file:', e);
    }
  }

  const musicEntries = allEntries.filter(
    (entry) => entry.master_metadata_track_name && entry.master_metadata_album_artist_name
  );

  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  // Group by year for this date
  const yearMap = new Map<number, { artist: string; track: string; time: string }[]>();

  for (const entry of musicEntries) {
    const entryDate = new Date(entry.ts);
    if (entryDate.getMonth() === targetMonth && entryDate.getDate() === targetDay) {
      const year = entryDate.getFullYear();
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year)!.push({
        artist: entry.master_metadata_album_artist_name || '',
        track: entry.master_metadata_track_name || '',
        time: entryDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      });
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, tracks]) => ({
      date: `${targetMonth + 1}/${targetDay}`,
      year,
      tracks: tracks.slice(0, 5),
    }))
    .sort((a, b) => b.year - a.year);
}
