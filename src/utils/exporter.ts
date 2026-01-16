import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportPDF = async () => {
    console.log('[exportPDF] start');
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
    const targetAreas = Array.from(
        document.querySelectorAll<HTMLElement>('.viewport-3d-container, .viewports-2d-container')
    );
    if (targetAreas.length === 0) {
        console.warn('[exportPDF] No target areas found for export.');
        alert('Export failed: export area not found.');
        return;
    }

    const rects = targetAreas.map((area) => area.getBoundingClientRect());
    const minLeft = Math.min(...rects.map((r) => r.left));
    const minTop = Math.min(...rects.map((r) => r.top));
    const maxRight = Math.max(...rects.map((r) => r.right));
    const maxBottom = Math.max(...rects.map((r) => r.bottom));

    const rect = {
        left: minLeft + window.scrollX,
        top: minTop + window.scrollY,
        width: maxRight - minLeft,
        height: maxBottom - minTop,
    };
    console.log('[exportPDF] capture rect', rect);

    let canvas: HTMLCanvasElement;
    try {
        canvas = await html2canvas(document.body, {
            useCORS: true,
            scale: 2, // Higher quality
            backgroundColor: '#ffffff',
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            ignoreElements: (element) => {
                if (element.classList.contains('sidebar')) return true;
                return false;
            },
        });
    } catch (error) {
        console.error('[exportPDF] html2canvas failed', error);
        alert('Failed to export PDF. See console for details.');
        return;
    }
    console.log('[exportPDF] canvas ready', { width: canvas.width, height: canvas.height });

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

    const pdfBlob = doc.output('blob');
    console.log('[exportPDF] pdf blob size', pdfBlob.size);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'cabinet-design.pdf';
    link.click();
    URL.revokeObjectURL(pdfUrl);
    console.log('[exportPDF] download triggered');
};
