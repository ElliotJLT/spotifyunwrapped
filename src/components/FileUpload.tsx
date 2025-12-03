import { Upload, FileCheck, Music2, Loader2, ExternalLink, ArrowRight, Ghost, Flame, Moon, SkipForward, Shuffle, Calendar } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { parseSpotifyJSON } from '@/lib/jsonParser';

interface FileUploadProps {
  onFilesUploaded: (files: Record<string, string>, rawJsonFiles?: string[]) => void;
}

const expectedFiles = [
  { key: 'listening_events', file: 'listening_events_clean.csv' },
  { key: 'daily_summary', file: 'daily_listening_summary.csv' },
  { key: 'top_artists', file: 'top_artists_overall.csv' },
  { key: 'hourly_profile', file: 'hourly_profile_top_artists.csv' },
  { key: 'sessions', file: 'listening_sessions_summary.csv' },
];

const insightPreviews = [
  { icon: Ghost, label: 'Forgotten Favorites', desc: 'Artists you abandoned' },
  { icon: Flame, label: 'Obsession Phases', desc: 'Your binge weeks' },
  { icon: Moon, label: 'Late Night Persona', desc: 'Your 2am music taste' },
  { icon: SkipForward, label: 'Skip Patterns', desc: 'What you really love' },
  { icon: Shuffle, label: 'Shuffle vs Curated', desc: 'Your listening style' },
  { icon: Calendar, label: 'Time Capsules', desc: 'Music memories' },
];

export function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jsonFiles, setJsonFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState({ currentFile: 0, totalFiles: 0, trackCount: 0 });

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles: Record<string, string> = { ...uploadedFiles };
    const newJsonFiles: string[] = [...jsonFiles];

    for (const file of Array.from(files)) {
      const text = await file.text();
      const fileName = file.name.toLowerCase();

      // Check if it's a JSON file (Spotify extended streaming history)
      if (fileName.endsWith('.json')) {
        newJsonFiles.push(text);
        continue;
      }

      // CSV file handling (existing logic)
      for (const expected of expectedFiles) {
        if (fileName.includes(expected.key.replace('_', '')) || 
            fileName === expected.file.toLowerCase()) {
          newFiles[expected.key] = text;
          break;
        }
      }

      // Fallback: try to match by partial name
      if (fileName.includes('listening') && fileName.includes('event')) {
        newFiles['listening_events'] = text;
      } else if (fileName.includes('daily')) {
        newFiles['daily_summary'] = text;
      } else if (fileName.includes('artist') && !fileName.includes('hourly')) {
        newFiles['top_artists'] = text;
      } else if (fileName.includes('hourly')) {
        newFiles['hourly_profile'] = text;
      } else if (fileName.includes('session')) {
        newFiles['sessions'] = text;
      }
    }

    // If we have JSON files, process them
    if (newJsonFiles.length > 0) {
      setIsProcessing(true);
      setJsonFiles(newJsonFiles);
      setProgress({ currentFile: 0, totalFiles: newJsonFiles.length, trackCount: 0 });
      
      // Use setTimeout to allow UI to update before heavy processing
      setTimeout(() => {
        try {
          // Count total tracks for progress
          let totalTracks = 0;
          newJsonFiles.forEach((jsonText, index) => {
            const entries = JSON.parse(jsonText);
            totalTracks += entries.length;
            setProgress(prev => ({ 
              ...prev, 
              currentFile: index + 1, 
              trackCount: totalTracks 
            }));
          });
          
          const parsedData = parseSpotifyJSON(newJsonFiles);
          const combinedFiles = {
            ...newFiles,
            listening_events: parsedData.listening_events,
            daily_summary: parsedData.daily_summary,
            top_artists: parsedData.top_artists,
            hourly_profile: parsedData.hourly_profile,
            sessions: parsedData.sessions,
          };
          setUploadedFiles(combinedFiles);
          setIsProcessing(false);
          onFilesUploaded(combinedFiles, newJsonFiles);
        } catch (e) {
          console.error('Error processing JSON files:', e);
          setIsProcessing(false);
        }
      }, 100);
      return;
    }

    setUploadedFiles(newFiles);

    if (Object.keys(newFiles).length >= 1) {
      onFilesUploaded(newFiles);
    }
  }, [uploadedFiles, onFilesUploaded, jsonFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 animate-fade-up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Music2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground">
            Your Music Diary
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Discover insights Wrapped won't show you
          </p>
        </div>

        {/* Orange orb glow */}
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/15 via-amber-500/25 to-orange-500/15 rounded-3xl blur-3xl animate-pulse-glow" />
          <div className="absolute -inset-3 bg-gradient-to-br from-orange-400/10 to-amber-600/10 rounded-2xl blur-2xl" />
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative card-elevated p-12 transition-all duration-300 cursor-pointer
              ${isDragging ? 'border-orange-400 scale-[1.02]' : 'hover:border-orange-400/50'}
            `}
            style={{ 
              boxShadow: isDragging 
                ? '0 0 40px rgba(251, 146, 60, 0.3)' 
                : '0 0 20px rgba(251, 146, 60, 0.1)' 
            }}
          >
            <input
              type="file"
              multiple
              accept=".csv,.json"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-colors
                ${isDragging ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400'}
              `}>
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-foreground font-medium text-lg">
                  {isProcessing ? 'Processing your listening history...' : 'Drop your JSON or CSV files here'}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {isProcessing 
                    ? `File ${progress.currentFile} of ${progress.totalFiles} • ${progress.trackCount.toLocaleString()} tracks found`
                    : 'or click to browse'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {jsonFiles.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-primary/20 text-primary border border-primary/30">
            <FileCheck className="w-4 h-4 flex-shrink-0" />
            <span>{jsonFiles.length} JSON file(s) loaded • Ready to explore!</span>
          </div>
        )}

        {/* Auto-scrolling Insight Carousel */}
        <div className="relative overflow-hidden py-1">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="flex gap-3 animate-marquee">
            {[...insightPreviews, ...insightPreviews].map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={`${insight.label}-${index}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/50"
                >
                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">{insight.label}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">• {insight.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {Object.keys(uploadedFiles).length > 0 && !isProcessing && (
          <p className="text-center text-muted-foreground text-sm animate-fade-in">
            {Object.keys(uploadedFiles).length} data set(s) ready • Scroll down to explore
          </p>
        )}

        {/* How to get your data */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <p className="text-muted-foreground text-sm text-center mb-4">Don't have your data yet?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card/50 border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">1</span>
                <span className="text-foreground font-medium text-sm">Request your data</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                Go to Spotify Privacy settings and request "Extended streaming history"
              </p>
              <a
                href="https://www.spotify.com/us/account/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
              >
                Open Spotify Privacy
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">2</span>
                <span className="text-foreground font-medium text-sm">Upload the JSON files</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                Once you receive the email (up to 30 days), upload the JSON files here
              </p>
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <span>Your data stays on your device</span>
                <ArrowRight className="w-3 h-3" />
                <span>Never uploaded</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
