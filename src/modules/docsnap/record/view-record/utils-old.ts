import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const formatFieldLabel = (fieldId: string): string => {
  return fieldId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const convertPdfToImages = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;
    const pagesToRender = Math.min(totalPages, 5);

    if (totalPages > 5) {
      alert(`PDF has ${totalPages} pages. Only rendering the first 5 for performance.`);
    }
    const imagePromises: Promise<string>[] = [];
    for (let i = 1; i <= pagesToRender; i++) {
      imagePromises.push(renderPageToImage(pdf, i));
    }
    const images = await Promise.all(imagePromises);
    return images;
  } catch (error: any) {
    console.error('Error converting PDF to images:', error?.message);
    return Promise.reject(error);
  }
};

const renderPageToImage = async (pdf: any, pageNumber: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return reject(new Error('Could not create canvas context'));
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      canvas.toBlob(blob => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to create Blob from canvas'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
};
