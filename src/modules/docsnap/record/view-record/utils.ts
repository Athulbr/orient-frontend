import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const formatFieldLabel = (fieldId: string): string => {
  return fieldId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const convertPdfToImages = async (
  file: File,
  options?: {
    quality?: 'standard' | 'high';
    maxPages?: number;
  }
): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;
    const maxPages = options?.maxPages || 5;
    const pagesToRender = Math.min(totalPages, maxPages);

    if (totalPages > maxPages) {
      alert(`PDF has ${totalPages} pages. Only rendering the first ${maxPages} for performance.`);
    }

    const imagePromises: Promise<string>[] = [];
    const renderFunction = options?.quality === 'standard' ? renderPageToImage : renderPageToImageHighQuality;

    for (let i = 1; i <= pagesToRender; i++) {
      imagePromises.push(renderFunction(pdf, i));
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

      // Increase scale for better quality (from 1.5 to 2.5)
      const scale = 2.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return reject(new Error('Could not create canvas context'));
      }

      // Set canvas dimensions with high DPI support
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Improve rendering quality
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create Blob from canvas'));
          }
        },
        'image/png',
        1.0
      ); // Set quality to maximum (1.0)
    } catch (error) {
      reject(error);
    }
  });
};

// High-quality rendering with device pixel ratio support
const renderPageToImageHighQuality = async (pdf: any, pageNumber: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = await pdf.getPage(pageNumber);

      // Get device pixel ratio for high-DPI displays
      const devicePixelRatio = window.devicePixelRatio || 1;
      const baseScale = 2.5;
      const scale = baseScale * devicePixelRatio;

      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return reject(new Error('Could not create canvas context'));
      }

      // Set canvas dimensions accounting for device pixel ratio
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Improve rendering quality
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create Blob from canvas'));
          }
        },
        'image/png',
        1.0
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const purchaseOrder = {
  basic_details: {
    po_number: {
      value: '45049798225',
      confidence: 0.9999200105667114,
      bbox: {
        x_min: '0.5505514705882353',
        y_min: '0.1171875',
        x_max: '0.6428079044117647',
        y_max: '0.12890625',
      },
      page: 1,
      similarity: 1,
      checked: true,
    },
    contact_email: {
      value: 'samantha.kain@ssmhealth.com',
      confidence: 0.5532528162002563,
      bbox: {
        x_min: '0.6251148897058824',
        y_min: '0.36328125',
        x_max: '0.8121553308823529',
        y_max: '0.3740234375',
      },
      page: 1,
      similarity: 1,
    },
    subtotal: {
      value: 421.02,
    },
    total_amount: {
      value: 421.02,
    },
  },
  ship_to: {
    name: {
      value: 'SSM Health St Agnes Hospital Fond du Lac',
      confidence: 0.998481921851635,
      bbox: {
        x_min: '0.04503676470588236',
        y_min: '0.3251953125',
        x_max: '0.30284926470588236',
        y_max: '0.33984375',
      },
      page: 1,
      similarity: 1,
    },
    attn: {
      value: 'Received',
      confidence: 0.9829133152961731,
      bbox: {
        x_min: '0.07915900735294118',
        y_min: '0.337890625',
        x_max: '0.13982077205882354',
        y_max: '0.349609375',
      },
      page: 1,
      similarity: 1,
      checked: true,
    },
    street: {
      value: '430 E Division St',
      confidence: 0.995931088924408,
      bbox: {
        x_min: '0.04377297794117646',
        y_min: '0.34765625',
        x_max: '0.14866727941176472',
        y_max: '0.361328125',
      },
      page: 1,
      similarity: 1,
    },
    city: {
      value: 'FOND DU LAC',
      confidence: 0.8650267918904623,
      bbox: {
        x_min: '0.04503676470588236',
        y_min: '0.3603515625',
        x_max: '0.13729319852941174',
        y_max: '0.3720703125',
      },
      page: 1,
      similarity: 1,
    },
    state: {
      value: 'WIZ',
      confidence: 0.9992376565933228,
      bbox: {
        x_min: '0.1360294117647059',
        y_min: '0.359375',
        x_max: '0.1575137867647059',
        y_max: '0.3720703125',
      },
      page: 1,
      similarity: 1,
      checked: true,
    },
    zip: {
      value: '54935',
      confidence: 0.99985671043396,
      bbox: {
        x_min: '0.16004136029411764',
        y_min: '0.3603515625',
        x_max: '0.2004825367647059',
        y_max: '0.3720703125',
      },
      page: 1,
      similarity: 1,
    },
  },
  bill_to: {
    attn: {
      value: 'Accounts Payable Department',
      confidence: 0.9950417280197144,
      bbox: {
        x_min: '0.07789522058823528',
        y_min: '0.1171875',
        x_max: '0.25861672794117646',
        y_max: '0.1318359375',
      },
      page: 1,
      similarity: 1,
    },
    street: {
      value: '12800 Corporate Hill Drive',
      confidence: 0.9384271949529648,
      bbox: {
        x_min: '0.0475643382352941',
        y_min: '0.12890625',
        x_max: '0.20553768382352944',
        y_max: '0.1416015625',
      },
      page: 1,
      similarity: 1,
    },
    city: {
      value: 'St. Louis',
      confidence: 0.8439784646034241,
      bbox: {
        x_min: '0.0475643382352941',
        y_min: '0.140625',
        x_max: '0.10569852941176472',
        y_max: '0.1533203125',
      },
      page: 1,
      similarity: 0.95,
    },
    state: {
      value: 'MO',
      confidence: 0.9996944665908813,
      bbox: {
        x_min: '0.10569852941176472',
        y_min: '0.140625',
        x_max: '0.13097426470588236',
        y_max: '0.15234375',
      },
      page: 1,
      similarity: 1,
    },
    zip: {
      value: '63135',
      confidence: 0.999576985836029,
      bbox: {
        x_min: '0.12971047794117646',
        y_min: '0.1416015625',
        x_max: '0.17015165441176472',
        y_max: '0.15234375',
      },
      page: 1,
      similarity: 1,
      checked: true,
    },
    bill_to_company: {
      value: 'SSM Health Care',
      confidence: 0.9986145496368408,
      bbox: {
        x_min: '0.0475643382352941',
        y_min: '0.1064453125',
        x_max: '0.15372242647058826',
        y_max: '0.1181640625',
      },
      page: 1,
      similarity: 1,
    },
  },
  line_items: [
    {
      SKU: {
        value: 'FEI-10-5676',
        confidence: 0.9866515398025513,
        bbox: {
          x_min: '0.26746323529411764',
          y_min: '0.439453125',
          x_max: '0.3357077205882353',
          y_max: '0.451171875',
        },
        page: 1,
        similarity: 1,
      },
      Description: {
        value: 'Rep Cord Tubing Orange',
        confidence: 0.9929376244544983,
        bbox: {
          x_min: '0.17015165441176472',
          y_min: '0.423828125',
          x_max: '0.31295955882352944',
          y_max: '0.4404296875',
        },
        page: 1,
        similarity: 1,
      },
      Quantity: {
        value: '2',
        confidence: 0.9844420552253723,
        bbox: {
          x_min: '0.5909926470588235',
          y_min: '0.42578125',
          x_max: '0.607421875',
          y_max: '0.4404296875',
        },
        page: 1,
        similarity: 1,
      },
      UM: {
        value: 'BX',
        confidence: 0.9977368116378784,
        bbox: {
          x_min: '0.6238511029411765',
          y_min: '0.42578125',
          x_max: '0.6478630514705882',
          y_max: '0.4384765625',
        },
        page: 1,
        similarity: 1,
      },
      'Delivery Date': {
        value: '08/13/2024',
        confidence: 0.9955280423164368,
        bbox: {
          x_min: '0.671875',
          y_min: '0.4267578125',
          x_max: '0.7401194852941176',
          y_max: '0.4375',
        },
        page: 1,
        similarity: 1,
      },
      Price: {
        value: '64.44',
        confidence: 0.9613459706306458,
        bbox: {
          x_min: '0.8033088235294117',
          y_min: '0.4248046875',
          x_max: '0.84375',
          y_max: '0.439453125',
        },
        page: 1,
        similarity: 1,
      },
      'Net Amount': {
        value: '128.88',
        confidence: 0.9208283424377441,
        bbox: {
          x_min: '0.9271599264705883',
          y_min: '0.4248046875',
          x_max: '0.97265625',
          y_max: '0.439453125',
        },
        page: 1,
        similarity: 1,
      },
    },
    {
      SKU: {
        value: 'FEI-10-5677',
        confidence: 0.9534770250320435,
        bbox: {
          x_min: '0.2661994485294118',
          y_min: '0.4921875',
          x_max: '0.3357077205882353',
          y_max: '0.50390625',
        },
        page: 1,
        similarity: 1,
      },
      Description: {
        value: 'Rep Cord Tubing Green',
        confidence: 0.8976165801286697,
        bbox: {
          x_min: '0.17015165441176472',
          y_min: '0.4775390625',
          x_max: '0.306640625',
          y_max: '0.4931640625',
        },
        page: 1,
        similarity: 1,
      },
      Quantity: {
        value: '2',
        confidence: 0.9854602217674255,
        bbox: {
          x_min: '0.5909926470588235',
          y_min: '0.478515625',
          x_max: '0.607421875',
          y_max: '0.4931640625',
        },
        page: 1,
        similarity: 1,
      },
      UM: {
        value: 'BX',
        confidence: 0.9995083808898926,
        bbox: {
          x_min: '0.6238511029411765',
          y_min: '0.478515625',
          x_max: '0.6465992647058824',
          y_max: '0.4912109375',
        },
        page: 1,
        similarity: 1,
      },
      'Delivery Date': {
        value: '08/13/2024',
        confidence: 0.9964926838874817,
        bbox: {
          x_min: '0.671875',
          y_min: '0.4794921875',
          x_max: '0.7401194852941176',
          y_max: '0.4912109375',
        },
        page: 1,
        similarity: 1,
      },
      Price: {
        value: '69.98',
        confidence: 0.7857793569564819,
        bbox: {
          x_min: '0.8045726102941176',
          y_min: '0.4794921875',
          x_max: '0.8412224264705883',
          y_max: '0.4912109375',
        },
        page: 1,
        similarity: 1,
      },
      'Net Amount': {
        value: '139.96',
        confidence: 0.9969519376754761,
        bbox: {
          x_min: '0.9284237132352942',
          y_min: '0.4794921875',
          x_max: '0.9701286764705883',
          y_max: '0.4912109375',
        },
        page: 1,
        similarity: 1,
      },
    },
    {
      SKU: {
        value: 'FEI-10-5678',
        confidence: 0.9905162453651428,
        bbox: {
          x_min: '0.26746323529411764',
          y_min: '0.544921875',
          x_max: '0.3357077205882353',
          y_max: '0.556640625',
        },
        page: 1,
        similarity: 1,
      },
      Description: {
        value: 'Rep Cord Tubing Blue',
        confidence: 0.9380754679441452,
        bbox: {
          x_min: '0.17015165441176472',
          y_min: '0.5302734375',
          x_max: '0.2990579044117647',
          y_max: '0.5458984375',
        },
        page: 1,
        similarity: 1,
      },
      Quantity: {
        value: '2',
        confidence: 0.9220991730690002,
        bbox: {
          x_min: '0.5922564338235294',
          y_min: '0.533203125',
          x_max: '0.6061580882352942',
          y_max: '0.544921875',
        },
        page: 1,
        similarity: 1,
      },
      UM: {
        value: 'BX',
        confidence: 0.9348235130310059,
        bbox: {
          x_min: '0.5796185661764706',
          y_min: '0.564453125',
          x_max: '0.607421875',
          y_max: '0.58203125',
        },
        page: 1,
        similarity: 1,
      },
      'Delivery Date': {
        value: '08/13/2024',
        confidence: 0.9983698725700378,
        bbox: {
          x_min: '0.671875',
          y_min: '0.5322265625',
          x_max: '0.7401194852941176',
          y_max: '0.5439453125',
        },
        page: 1,
        similarity: 1,
      },
      Price: {
        value: '76.09',
        confidence: 0.9724130630493164,
        bbox: {
          x_min: '0.8033088235294117',
          y_min: '0.5322265625',
          x_max: '0.8424862132352942',
          y_max: '0.5439453125',
        },
        page: 1,
        similarity: 1,
      },
      'Net Amount': {
        value: '152.18',
        confidence: 0.9899499416351318,
        bbox: {
          x_min: '0.9271599264705883',
          y_min: '0.5322265625',
          x_max: '0.9713924632352942',
          y_max: '0.5439453125',
        },
        page: 1,
        similarity: 1,
      },
    },
  ],
};
