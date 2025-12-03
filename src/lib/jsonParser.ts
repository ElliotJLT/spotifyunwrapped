import type { 
  ListeningEvent, 
  DailyListeningSummary, 
  TopArtist, 
  HourlyArtistProfile, 
  SessionSummary 
} from './csvParser';

interface SpotifyStreamingEntry {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
}

export interface ParsedSpotifyData {
  listening_events: string;
  daily_summary: string;
  top_artists: string;
  hourly_profile: string;
  sessions: string;
}

export function parseSpotifyJSON(jsonFiles: string[]): ParsedSpotifyData {
  // Parse all JSON files and combine entries
  const allEntries: SpotifyStreamingEntry[] = [];
  
  for (const jsonText of jsonFiles) {
    try {
      const entries = JSON.parse(jsonText) as SpotifyStreamingEntry[];
      allEntries.push(...entries);
    } catch (e) {
      console.error('Failed to parse JSON file:', e);
    }
  }

  // Filter out entries without track info (podcasts, etc.)
  const musicEntries = allEntries.filter(
    entry => entry.master_metadata_track_name && entry.master_metadata_album_artist_name
  );

  // Sort by timestamp
  musicEntries.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  // Generate all the derived data
  const listeningEvents = generateListeningEvents(musicEntries);
  const dailySummary = generateDailySummary(musicEntries);
  const topArtists = generateTopArtists(musicEntries);
  const hourlyProfile = generateHourlyProfile(musicEntries);
  const sessions = generateSessions(musicEntries);

  // Convert to CSV format strings (the dashboard expects CSV strings)
  return {
    listening_events: arrayToCSV(listeningEvents),
    daily_summary: arrayToCSV(dailySummary),
    top_artists: arrayToCSV(topArtists),
    hourly_profile: arrayToCSV(hourlyProfile),
    sessions: arrayToCSV(sessions),
  };
}

function generateListeningEvents(entries: SpotifyStreamingEntry[]): ListeningEvent[] {
  return entries.map(entry => ({
    timestamp: entry.ts,
    artist: entry.master_metadata_album_artist_name || '',
    track: entry.master_metadata_track_name || '',
    album: entry.master_metadata_album_album_name || '',
    duration_ms: entry.ms_played,
  }));
}

function generateDailySummary(entries: SpotifyStreamingEntry[]): DailyListeningSummary[] {
  const dailyMap = new Map<string, { minutes: number; tracks: Set<string>; artists: Set<string> }>();

  for (const entry of entries) {
    const date = entry.ts.split('T')[0];
    const existing = dailyMap.get(date) || { minutes: 0, tracks: new Set(), artists: new Set() };
    
    existing.minutes += entry.ms_played / 60000;
    existing.tracks.add(entry.master_metadata_track_name || '');
    existing.artists.add(entry.master_metadata_album_artist_name || '');
    
    dailyMap.set(date, existing);
  }

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    minutes_listened: Math.round(data.minutes),
    tracks_played: data.tracks.size,
    unique_artists: data.artists.size,
  }));
}

function generateTopArtists(entries: SpotifyStreamingEntry[]): TopArtist[] {
  const artistMap = new Map<string, { minutes: number; playCount: number; years: Set<number> }>();

  for (const entry of entries) {
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    const year = new Date(entry.ts).getFullYear();
    const existing = artistMap.get(artist) || { minutes: 0, playCount: 0, years: new Set() };
    
    existing.minutes += entry.ms_played / 60000;
    existing.playCount += 1;
    existing.years.add(year);
    
    artistMap.set(artist, existing);
  }

  // Create entries for each artist-year combination for the eras feature
  const result: TopArtist[] = [];
  
  for (const [artist, data] of artistMap.entries()) {
    // Add overall artist entry
    result.push({
      artist,
      total_minutes: Math.round(data.minutes),
      play_count: data.playCount,
    });
  }

  // Sort by total minutes
  return result.sort((a, b) => b.total_minutes - a.total_minutes);
}

function generateHourlyProfile(entries: SpotifyStreamingEntry[]): HourlyArtistProfile[] {
  const hourArtistMap = new Map<string, number>();

  for (const entry of entries) {
    const hour = new Date(entry.ts).getHours();
    const artist = entry.master_metadata_album_artist_name || '';
    if (!artist) continue;

    const key = `${hour}|${artist}`;
    hourArtistMap.set(key, (hourArtistMap.get(key) || 0) + entry.ms_played / 60000);
  }

  const result: HourlyArtistProfile[] = [];
  
  for (const [key, minutes] of hourArtistMap.entries()) {
    const [hourStr, artist] = key.split('|');
    result.push({
      hour: parseInt(hourStr),
      artist,
      minutes: Math.round(minutes),
    });
  }

  // Sort by hour, then by minutes descending
  return result.sort((a, b) => a.hour - b.hour || b.minutes - a.minutes);
}

function generateSessions(entries: SpotifyStreamingEntry[]): SessionSummary[] {
  if (entries.length === 0) return [];

  const sessions: SessionSummary[] = [];
  let sessionId = 1;
  let sessionStart = entries[0].ts;
  let sessionEnd = entries[0].ts;
  let sessionDuration = entries[0].ms_played;
  let trackCount = 1;

  const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes gap = new session

  for (let i = 1; i < entries.length; i++) {
    const currentTime = new Date(entries[i].ts).getTime();
    const previousTime = new Date(entries[i - 1].ts).getTime();
    const gap = currentTime - previousTime;

    if (gap > SESSION_GAP_MS) {
      // Save current session
      sessions.push({
        session_id: sessionId,
        start_time: sessionStart,
        end_time: sessionEnd,
        duration_minutes: Math.round(sessionDuration / 60000),
        tracks_count: trackCount,
      });

      // Start new session
      sessionId++;
      sessionStart = entries[i].ts;
      sessionEnd = entries[i].ts;
      sessionDuration = entries[i].ms_played;
      trackCount = 1;
    } else {
      sessionEnd = entries[i].ts;
      sessionDuration += entries[i].ms_played;
      trackCount++;
    }
  }

  // Don't forget the last session
  sessions.push({
    session_id: sessionId,
    start_time: sessionStart,
    end_time: sessionEnd,
    duration_minutes: Math.round(sessionDuration / 60000),
    tracks_count: trackCount,
  });

  return sessions;
}

function arrayToCSV(data: object[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(h => {
      const val = (row as Record<string, unknown>)[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val ?? '');
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}
