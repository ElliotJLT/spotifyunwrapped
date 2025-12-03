import { useState } from 'react';
import { Share2, Download, X, Loader2, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function ShareCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setProgress('Preparing dashboard...');
    
    try {
      const dashboard = document.querySelector('.min-h-screen.bg-background');
      if (!dashboard) {
        console.error('Dashboard not found');
        setIsGenerating(false);
        return;
      }

      // Hide elements that shouldn't be in the export
      const header = dashboard.querySelector('header');
      const originalHeaderDisplay = header?.style.display;
      if (header) header.style.display = 'none';

      setProgress('Capturing content...');
      
      // Capture full dashboard with better quality
      const canvas = await html2canvas(dashboard as HTMLElement, {
        backgroundColor: '#0c0a09',
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: dashboard.scrollHeight,
        height: dashboard.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure animations don't interfere
          const clonedDashboard = clonedDoc.querySelector('.min-h-screen.bg-background');
          if (clonedDashboard) {
            (clonedDashboard as HTMLElement).style.animation = 'none';
            clonedDashboard.querySelectorAll('*').forEach((el) => {
              (el as HTMLElement).style.animation = 'none';
              (el as HTMLElement).style.opacity = '1';
            });
          }
        },
      });

      // Restore header
      if (header && originalHeaderDisplay !== undefined) {
        header.style.display = originalHeaderDisplay;
      }

      setProgress('Generating PDF...');

      // Create PDF with better margins
      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 277; // A4 height minus margins
      const margin = 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.92),
        'JPEG',
        margin,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= (pageHeight - margin);

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.92),
          'JPEG',
          margin,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      pdf.save('my-music-diary.pdf');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
    
    setIsGenerating(false);
    setProgress('');
    setIsOpen(false);
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    setProgress('Capturing dashboard...');
    
    try {
      const dashboard = document.querySelector('.min-h-screen.bg-background');
      if (!dashboard) {
        setIsGenerating(false);
        return;
      }

      // Hide header for cleaner export
      const header = dashboard.querySelector('header');
      const originalHeaderDisplay = header?.style.display;
      if (header) header.style.display = 'none';

      const canvas = await html2canvas(dashboard as HTMLElement, {
        backgroundColor: '#0c0a09',
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: dashboard.scrollHeight,
        height: dashboard.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedDashboard = clonedDoc.querySelector('.min-h-screen.bg-background');
          if (clonedDashboard) {
            (clonedDashboard as HTMLElement).style.animation = 'none';
            clonedDashboard.querySelectorAll('*').forEach((el) => {
              (el as HTMLElement).style.animation = 'none';
              (el as HTMLElement).style.opacity = '1';
            });
          }
        },
      });

      // Restore header
      if (header && originalHeaderDisplay !== undefined) {
        header.style.display = originalHeaderDisplay;
      }

      const link = document.createElement('a');
      link.download = 'my-music-diary.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    
    setIsGenerating(false);
    setProgress('');
    setIsOpen(false);
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
        Export
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-medium">Export Your Diary</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Save your full music diary as a PDF or image to share with friends.
            </p>

            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progress || 'Generating... this may take a moment'}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isGenerating}
              >
                <FileText className="w-4 h-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="w-full gap-2"
                disabled={isGenerating}
              >
                <Image className="w-4 h-4" />
                Download Image
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your data stays on your device
            </p>
          </div>
        </div>
      )}
    </>
  );
}
