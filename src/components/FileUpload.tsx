import { Upload, FileCheck, Music2 } from 'lucide-react';
import { useState, useCallback } from 'react';

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

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles: Record<string, string> = { ...uploadedFiles };

    for (const file of Array.from(files)) {
      const text = await file.text();
      const fileName = file.name.toLowerCase();

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

    setUploadedFiles(newFiles);

    if (Object.keys(newFiles).length >= 1) {
      onFilesUploaded(newFiles);
    }
  }, [uploadedFiles, onFilesUploaded]);

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
            Upload your Spotify listening data to explore your musical journey
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
            accept=".csv"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-colors
              ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
            `}>
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-foreground font-medium text-lg">
                Drop your CSV files here
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                or click to browse
              </p>
            </div>
          </div>
        </div>

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

        {Object.keys(uploadedFiles).length > 0 && (
          <p className="text-center text-muted-foreground text-sm animate-fade-in">
            {Object.keys(uploadedFiles).length} file(s) loaded • Scroll down to explore
          </p>
        )}
      </div>
    </div>
  );
}
