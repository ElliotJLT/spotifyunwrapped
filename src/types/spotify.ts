export interface SpotifyData {
  listeningEvents: ListeningEvent[];
  dailySummary: DailySummary[];
  topArtists: TopArtist[];
  hourlyProfile: HourlyProfile[];
  sessions: Session[];
}

export interface ListeningEvent {
  timestamp: string;
  artist: string;
  track: string;
  album?: string;
  duration_ms?: number;
}

export interface DailySummary {
  date: string;
  minutes_listened: number;
  tracks_played?: number;
  unique_artists?: number;
}

export interface TopArtist {
  artist: string;
  total_minutes: number;
  play_count?: number;
  year?: number;
}

export interface HourlyProfile {
  hour: number;
  artist: string;
  minutes: number;
}

export interface Session {
  session_id?: number;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  tracks_count?: number;
}

export interface HeroStats {
  totalHours: number;
  uniqueArtists: number;
  longestSession: number;
  totalTracks: number;
  averageDaily: number;
}
