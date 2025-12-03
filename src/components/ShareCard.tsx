import { useState } from 'react';
import { Share2, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function ShareCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      const dashboard = document.querySelector('.min-h-screen.bg-background');
      if (!dashboard) {
        console.error('Dashboard not found');
        setIsGenerating(false);
        return;
      }

      // Capture full dashboard
      const canvas = await html2canvas(dashboard as HTMLElement, {
        backgroundColor: '#0c0a09',
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowHeight: dashboard.scrollHeight,
        height: dashboard.scrollHeight,
      });

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
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
    setIsOpen(false);
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    
    try {
      const dashboard = document.querySelector('.min-h-screen.bg-background');
      if (!dashboard) {
        setIsGenerating(false);
        return;
      }

      const canvas = await html2canvas(dashboard as HTMLElement, {
        backgroundColor: '#0c0a09',
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: dashboard.scrollHeight,
        height: dashboard.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = 'my-music-diary.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
    
    setIsGenerating(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4">
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
                <span>Generating... this may take a moment</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="w-full gap-2"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4" />
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
