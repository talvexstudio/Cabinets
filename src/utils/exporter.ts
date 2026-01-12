import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportPDF = async () => {
    // A3 Size: 297mm x 420mm (Portrait) or 420mm x 297mm (Landscape)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3'
    });

    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();

    // Capture exactly the area of the main-container
    // We capture document.body but crop it using the x,y,width,height options
    // This ensures we get the overlay Canvas but don't capture the sidebar or its empty space
    const targetArea = document.querySelector('.main-container');
    if (!targetArea) return;

    const rect = targetArea.getBoundingClientRect();

    const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        ignoreElements: (element) => {
            // Check if the element is inside the rect? No, html2canvas handles cropping.
            // But we can explicitely ignore sidebar to be safe, though cropping should handle it.
            if (element.classList.contains('sidebar')) return true;
            return false;
        }
    });

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit A3 while preserving aspect ratio
    const margin = 10;
    const maxW = docWidth - margin * 2;
    const maxH = docHeight - margin * 2;

    const srcW = canvas.width;
    const srcH = canvas.height;
    const ratio = Math.min(maxW / srcW, maxH / srcH);

    const destW = srcW * ratio;
    const destH = srcH * ratio;

    doc.addImage(imgData, 'PNG', margin, margin, destW, destH);

    doc.save('cabinet-design.pdf');
};
