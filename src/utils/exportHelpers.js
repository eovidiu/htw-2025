import { jsPDF } from 'jspdf';
import { getPhoto } from './indexedDB';
import { getAllFeedback } from './feedbackStorage';

/**
 * Format timestamp for PDF display
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convert blob to base64 data URL
 */
const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Calculate image dimensions to fit within PDF page
 */
const calculateImageDimensions = (imgWidth, imgHeight, maxWidth, maxHeight) => {
  let width = imgWidth;
  let height = imgHeight;

  const ratio = Math.min(maxWidth / width, maxHeight / height);

  if (ratio < 1) {
    width *= ratio;
    height *= ratio;
  }

  return { width, height };
};

/**
 * Export captures to PDF
 */
export const exportToPDF = async (captures, onProgress, includeFeedback = true) => {
  try {
    if (!captures || captures.length === 0) {
      throw new Error('No captures to export');
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Get feedback data
    const allFeedback = includeFeedback ? getAllFeedback() : [];

    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('How to Web 2025 - Conference Captures', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Exported: ${formatTimestamp(new Date().toISOString())}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total captures: ${captures.length}`, margin, yPosition);
    yPosition += 5;
    if (allFeedback.length > 0) {
      doc.text(`Session feedback: ${allFeedback.length}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;

    // Add separator line
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Process each capture
    for (let i = 0; i < captures.length; i++) {
      const capture = captures[i];

      // Report progress
      if (onProgress) {
        onProgress(Math.round((i / captures.length) * 100));
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Add timestamp
      doc.setFontSize(9);
      doc.setTextColor(128);
      doc.setFont('helvetica', 'italic');
      doc.text(formatTimestamp(capture.timestamp), margin, yPosition);
      yPosition += 6;

      // Add tags if present
      if (capture.tags && capture.tags.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(70, 130, 180); // Steel blue
        const tagsText = capture.tags.map(tag => `#${tag}`).join(' ');
        doc.text(tagsText, margin, yPosition);
        yPosition += 6;
      }

      if (capture.type === 'text') {
        // Add text content
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(capture.text, contentWidth);

        // Check if text fits on current page
        const textHeight = lines.length * 6;
        if (yPosition + textHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text(lines, margin, yPosition);
        yPosition += textHeight + 8;

      } else if (capture.type === 'photo' && capture.photoId) {
        try {
          // Load photo from IndexedDB
          const blob = await getPhoto(capture.photoId);

          if (blob) {
            const dataUrl = await blobToDataURL(blob);

            // Get image properties
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = dataUrl;
            });

            // Calculate dimensions to fit within content area
            const maxImageHeight = 120; // mm
            const { width, height } = calculateImageDimensions(
              img.width,
              img.height,
              contentWidth,
              maxImageHeight
            );

            // Convert pixels to mm (rough conversion)
            const imgWidthMm = (width / img.width) * contentWidth;
            const imgHeightMm = (height / img.height) * maxImageHeight;

            // Check if image fits on current page
            if (yPosition + imgHeightMm > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }

            // Add image to PDF
            doc.addImage(dataUrl, 'JPEG', margin, yPosition, imgWidthMm, imgHeightMm);
            yPosition += imgHeightMm + 8;
          }
        } catch (error) {
          console.error('Error loading photo for PDF:', error);
          // Add error message in PDF
          doc.setFontSize(9);
          doc.setTextColor(255, 0, 0);
          doc.text('[Image could not be loaded]', margin, yPosition);
          yPosition += 10;
        }
      }

      // Add separator between items (except last one)
      if (i < captures.length - 1) {
        doc.setDrawColor(220);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    }

    // Add session feedback section if available
    if (allFeedback.length > 0) {
      // Add new page for feedback
      doc.addPage();
      yPosition = margin;

      // Feedback section header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Session Feedback', margin, yPosition);
      yPosition += 10;

      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Process each feedback
      for (let i = 0; i < allFeedback.length; i++) {
        const fb = allFeedback[i];

        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Session title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        const sessionTitle = doc.splitTextToSize(fb.sessionTitle, contentWidth);
        doc.text(sessionTitle, margin, yPosition);
        yPosition += sessionTitle.length * 6 + 3;

        // Speaker info
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`${fb.speakerName} • ${fb.speakerCompany} • ${fb.stage}`, margin, yPosition);
        yPosition += 6;

        // Ratings
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Overall: ${'★'.repeat(fb.ratings.overall)}${'☆'.repeat(5 - fb.ratings.overall)}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Speaker: ${'★'.repeat(fb.ratings.speaker)}${'☆'.repeat(5 - fb.ratings.speaker)}`, margin, yPosition);
        yPosition += 5;

        if (fb.ratings.content > 0) {
          doc.text(`Content: ${'★'.repeat(fb.ratings.content)}${'☆'.repeat(5 - fb.ratings.content)}`, margin, yPosition);
          yPosition += 5;
        }

        if (fb.ratings.presentation > 0) {
          doc.text(`Presentation: ${'★'.repeat(fb.ratings.presentation)}${'☆'.repeat(5 - fb.ratings.presentation)}`, margin, yPosition);
          yPosition += 5;
        }

        if (fb.recommend !== null) {
          doc.text(`Recommend: ${fb.recommend ? 'Yes' : 'No'}`, margin, yPosition);
          yPosition += 5;
        }

        // Written feedback
        if (fb.feedback) {
          yPosition += 3;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(60);
          const feedbackLines = doc.splitTextToSize(fb.feedback, contentWidth);
          doc.text(feedbackLines, margin, yPosition);
          yPosition += feedbackLines.length * 5;
        }

        // Separator
        yPosition += 5;
        if (i < allFeedback.length - 1) {
          doc.setDrawColor(220);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
        }
      }
    }

    // Report completion
    if (onProgress) {
      onProgress(100);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `htw-2025-captures-${timestamp}.pdf`;

    // Save PDF
    doc.save(filename);

    return { success: true, filename };

  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

/**
 * Copy all text content to clipboard
 */
export const copyAllTextToClipboard = async (captures) => {
  try {
    const textCaptures = captures.filter(c => c.type === 'text');

    if (textCaptures.length === 0) {
      throw new Error('No text captures to copy');
    }

    const text = textCaptures
      .map(c => {
        const timestamp = formatTimestamp(c.timestamp);
        const tags = c.tags ? ` [${c.tags.join(', ')}]` : '';
        return `[${timestamp}]${tags}\n${c.text}`;
      })
      .join('\n\n---\n\n');

    await navigator.clipboard.writeText(text);

    return { success: true, count: textCaptures.length };

  } catch (error) {
    console.error('Copy to clipboard error:', error);
    throw error;
  }
};
