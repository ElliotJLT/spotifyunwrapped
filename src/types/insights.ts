export interface ForgottenArtist {
  artist: string;
  peakYear: number;
  peakMinutes: number;
  lastPlayed: string;
  totalPlays: number;
}

export interface ObsessionPhase {
  weekStart: string;
  artist: string;
  plays: number;
  percentOfWeek: number;
}

export interface TimePeriodProfile {
  period: 'lateNight' | 'morning' | 'afternoon' | 'evening';
  label: string;
  artists: { artist: string; minutes: number }[];
  totalMinutes: number;
}

export interface ArtistBehavior {
  artist: string;
  skipRate: number;
  completionRate: number;
  totalPlays: number;
}

export interface ShuffleStats {
  year: number;
  shufflePlays: number;
  intentionalPlays: number;
  shufflePercent: number;
}

export interface TimeCapsule {
  date: string;
  year: number;
  tracks: { artist: string; track: string; time: string }[];
}

export interface InsightsData {
  forgottenArtists: ForgottenArtist[];
  obsessionPhases: ObsessionPhase[];
  timePeriodProfiles: TimePeriodProfile[];
  artistBehaviors: ArtistBehavior[];
  shuffleStats: ShuffleStats[];
  overallShufflePercent: number;
  overallSkipRate: number;
  overallCompletionRate: number;
}
