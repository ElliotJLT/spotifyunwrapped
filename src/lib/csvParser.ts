export interface ListeningEvent {
  timestamp: string;
  artist: string;
  track: string;
  album: string;
  duration_ms: number;
}

export interface DailyListeningSummary {
  date: string;
  minutes_listened: number;
  tracks_played: number;
  unique_artists: number;
}

export interface TopArtist {
  artist: string;
  total_minutes: number;
  play_count: number;
  year?: number;
}

export interface HourlyArtistProfile {
  hour: number;
  artist: string;
  minutes: number;
}

export interface SessionSummary {
  session_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  tracks_count: number;
}

export function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to parse as number
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });

    data.push(row as T);
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  
  return `${mins}m`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}
