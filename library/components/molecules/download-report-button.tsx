import { Button } from "@/library/components/atoms/button"
import { Download, Loader2 } from "lucide-react"
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { PlantDetailResponse } from "@/library/types/plant-detail"
import { useState, useRef, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"

interface DownloadReportButtonProps {
  // data: PlantDetailResponse;
  className?: string;
}

export function DownloadReportButton({ className }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Try multiple selectors to find the main container element to capture
      let contentContainer = document.querySelector('#plant-data-container');
      
      if (!contentContainer) {
        // Try comparison view container
        contentContainer = document.querySelector('#comparison-data-container');
      }
      
      if (!contentContainer) {
        // Fallback to other possible selectors
        contentContainer = document.querySelector('.space-y-6');
      }
      
      if (!contentContainer) {
        // Another fallback - look for the container with charts
        contentContainer = document.querySelector('[class*="space-y"]');
      }

      if (!contentContainer) {
        toast.error('Could not find content to download');
        setIsGenerating(false);
        return;
      }

      // Get the current scroll position
      const scrollPosition = window.scrollY;

      // Hide chart type selectors temporarily
      const selectors = document.querySelectorAll('.w-\\[110px\\]');
      selectors.forEach(selector => {
        (selector as HTMLElement).style.display = 'none';
      });

      // Fix OKLCH colors to prevent errors
      const svgElements = document.querySelectorAll('svg *[fill], svg *[stroke]');
      svgElements.forEach(el => {
        const element = el as SVGElement;
        const fill = element.getAttribute('fill');
        const stroke = element.getAttribute('stroke');

        if (fill && fill.includes('oklch')) {
          element.setAttribute('fill', '#4f46e5');
        }
        if (stroke && stroke.includes('oklch')) {
          element.setAttribute('stroke', '#4f46e5');
        }
      });

      try {
        // Temporarily scroll to top to ensure full capture
        window.scrollTo(0, 0);

        // Short delay to allow any reflow/repaint
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture the entire content at once
        const canvas = await html2canvas(contentContainer as HTMLElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollY: -window.scrollY,
          height: (contentContainer as HTMLElement).scrollHeight,
          windowWidth: (contentContainer as HTMLElement).scrollWidth
        });

        // Create PDF with dimensions based on the canvas
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait', // Use portrait for full-page capture
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        // Add the entire image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        // Save the PDF
        pdf.save(`plant-report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
        
        toast.success('Report downloaded successfully!');
      } finally {
        // Restore scroll position
        window.scrollTo(0, scrollPosition);

        // Restore chart type selectors
        selectors.forEach(selector => {
          (selector as HTMLElement).style.display = '';
        });

        // Restore SVG colors
        svgElements.forEach(el => {
          const element = el as SVGElement;
          const fill = element.getAttribute('fill');
          const stroke = element.getAttribute('stroke');

          if (fill && fill === '#4f46e5') {
            element.setAttribute('fill', 'var(--color-chart-1)');
          }
          if (stroke && stroke === '#4f46e5') {
            element.setAttribute('stroke', 'var(--color-chart-1)');
          }
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className={className + " bg-green-500 text-white hover:bg-green-600 hover:text-white hover:scale-105 duration-300 transition-all"}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </>
      )}
    </Button>
  );
}