import { useState, useRef } from 'react';
import { Share2, Download, X, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import type { HeroStats } from '@/types/spotify';

interface ShareCardProps {
  stats: HeroStats;
  topArtists: string[];
}

export function ShareCard({ stats, topArtists }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0c0a09',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'my-music-diary.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0c0a09',
        scale: 2,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'my-music-diary.png', { type: 'image/png' });
          const shareData = {
            files: [file],
            title: 'My Music Diary',
            text: 'Check out my listening stats! Get yours at',
          };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            // Fallback to download
            handleDownload();
          }
        } else {
          // Fallback to download
          handleDownload();
        }
        setIsGenerating(false);
      });
    } catch (error) {
      console.error('Failed to share:', error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Stats
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-medium">Share Your Stats</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The card to be captured */}
            <div
              ref={cardRef}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#0c0a09' }}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-white/90 font-medium">My Music Diary</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs">Total Hours</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.totalHours.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs">Artists</p>
                    <p className="text-2xl font-bold text-white">{stats.uniqueArtists.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs">Tracks Played</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTracks.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs">Daily Avg</p>
                    <p className="text-2xl font-bold text-white">{stats.averageDaily}m</p>
                  </div>
                </div>

                {/* Top Artists */}
                {topArtists.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/50 text-xs">Top Artists</p>
                    <div className="flex flex-wrap gap-2">
                      {topArtists.slice(0, 5).map((artist) => (
                        <span
                          key={artist}
                          className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/30 text-xs text-center">
                    musicdiary.app • Your listening journey
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isGenerating}
              >
                <Share2 className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Share'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
