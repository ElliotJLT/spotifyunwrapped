import { Upload, FileCheck, Music2, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { parseSpotifyJSON } from '@/lib/jsonParser';

interface FileUploadProps {
  onFilesUploaded: (files: Record<string, string>) => void;
}

const expectedFiles = [
  { key: 'listening_events', label: 'Listening Events', file: 'listening_events_clean.csv' },
  { key: 'daily_summary', label: 'Daily Summary', file: 'daily_listening_summary.csv' },
  { key: 'top_artists', label: 'Top Artists', file: 'top_artists_overall.csv' },
  { key: 'hourly_profile', label: 'Hourly Profile', file: 'hourly_profile_top_artists.csv' },
  { key: 'sessions', label: 'Sessions', file: 'listening_sessions_summary.csv' },
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
          onFilesUploaded(combinedFiles);
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
            Upload your Spotify extended streaming history JSON files to explore your musical journey
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative card-elevated p-12 transition-all duration-300 cursor-pointer
            ${isDragging ? 'border-primary glow-primary scale-[1.02]' : 'hover:border-primary/50'}
          `}
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
              ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
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

        {jsonFiles.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-accent/20 text-accent border border-accent/30">
            <FileCheck className="w-4 h-4 flex-shrink-0" />
            <span>{jsonFiles.length} JSON file(s) loaded</span>
          </div>
        )}

        {jsonFiles.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {expectedFiles.map((file) => (
              <div
                key={file.key}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all
                  ${uploadedFiles[file.key] 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'bg-secondary/50 text-muted-foreground border border-transparent'}
                `}
              >
                <FileCheck className={`w-4 h-4 flex-shrink-0 ${uploadedFiles[file.key] ? 'text-accent' : 'text-muted-foreground/50'}`} />
                <span className="truncate">{file.label}</span>
              </div>
            ))}
          </div>
        )}

        {Object.keys(uploadedFiles).length > 0 && !isProcessing && (
          <p className="text-center text-muted-foreground text-sm animate-fade-in">
            {Object.keys(uploadedFiles).length} data set(s) ready • Scroll down to explore
          </p>
        )}
      </div>
    </div>
  );
}
