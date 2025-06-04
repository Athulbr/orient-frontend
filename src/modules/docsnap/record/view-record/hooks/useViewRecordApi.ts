import { useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../../utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages } from '../utils';

export const useViewRecordApi = () => {
  const { setState } = useViewRecordState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    getRecordApiById(id);
  }, [id]);

  // ============================= Get Record By Id ==================================

  const getRecordApiById = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_API_URL}/api/idp/history/${id}`);
      const topLevelFields: Record<string, any> = {};
      const objectFields: Record<string, any> = {};
      const arrayFields: Record<string, any>[] = [];
      const tableNames: string[] = [];
      Object.entries(res.data.extractedData).forEach(([key, value]: any) => {
        if (Array.isArray(value)) {
          // its array
          arrayFields.push(value);
          tableNames.push(key);
        } else if (typeof value === 'object' && value !== null && value?.value === undefined) {
          // its object
          objectFields[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // its Key Value
          topLevelFields[key] = value;
        }
      });
      const s3Response = await httpRequest('POST', `${import.meta.env.VITE_API_URL}/api/idp/document/get/file`, {
        fileName: res.data.pdfFileName,
      });
      const imageData = s3Response?.data?.Body?.data;
      if (!imageData) {
        toast.error('S3 document not found');
        return;
      }
      const uint8Array = new Uint8Array(imageData);
      const getFileType = await fileTypeFromBuffer(uint8Array);
      let pdfFile: any;
      let imageUrl;
      if (getFileType?.mime && getFileType?.mime !== 'application/pdf') {
        pdfFile = await binaryToFile(uint8Array, `image.${getFileType.ext}`, getFileType?.mime);
        imageUrl = [URL.createObjectURL(pdfFile).toString()];
      } else {
        pdfFile = await binaryToFile(uint8Array, `document.${getFileType?.ext}`, getFileType?.mime);
        imageUrl = await convertPdfToImages(pdfFile);
      }

      setTimeout(() => {
        setState(prev => ({ ...prev, topLevelFields, objectFields, arrayFields, tableNames, loading: false, images: imageUrl }));
        toast.success('Record fetched successfully');
      }, 2000);
    } catch (error) {
      toast.error('Failed to get Record');
    }
  };

  return { getRecordApiById };
};

const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
  const blob = new Blob([binaryData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

const extractedData: Record<string, any> = {
  po_number: {
    value: 'HC7536',
    confidence: 0.7817650437355042,
    bbox: {
      x_min: '0.7704503676470589',
      y_min: '0.224609375',
      x_max: '0.8323759191176471',
      y_max: '0.2392578125',
    },
    page: 1,
    similarity: 1,
  },
  contact_email: {
    value: 'purchasing@hebronlions.org',
    confidence: 0.48133599758148193,
    bbox: {
      x_min: '0.5012637867647058',
      y_min: '0.8515625',
      x_max: '0.6870404411764706',
      y_max: '0.865234375',
    },
    page: 1,
    similarity: 0.85,
  },
  phone_number: {
    value: null,
  },
  contract_number: {
    value: null,
  },
  ship_to: {
    name: {
      value: 'Hebron Christian Academy',
      confidence: 0.922877848148346,
      bbox: {
        x_min: '0.6238511029411765',
        y_min: '0.32421875',
        x_max: '0.8336397058823529',
        y_max: '0.33984375',
      },
      page: 1,
      similarity: 1,
    },
    attn: {
      value: 'Cassie Snow',
      confidence: 0.9998376667499542,
      bbox: {
        x_min: '0.4797794117647059',
        y_min: '0.46484375',
        x_max: '0.5745634191176471',
        y_max: '0.4765625',
      },
      page: 1,
      similarity: 1,
    },
    street: {
      value: '2965 Old Peachtree Rd',
      confidence: 0.9979861825704575,
      bbox: {
        x_min: '0.091796875',
        y_min: '0.36328125',
        x_max: '0.2775735294117647',
        y_max: '0.37890625',
      },
      page: 1,
      similarity: 1,
    },
    city: {
      value: 'Dacula',
      confidence: 0.9988370537757874,
      bbox: {
        x_min: '0.26872702205882354',
        y_min: '0.1083984375',
        x_max: '0.32180606617647056',
        y_max: '0.126953125',
      },
      page: 1,
      similarity: 1,
    },
    state: {
      value: 'GA',
      confidence: 0.9998961687088013,
      bbox: {
        x_min: '0.4443933823529412',
        y_min: '0.109375',
        x_max: '0.4684053308823529',
        y_max: '0.126953125',
      },
      page: 1,
      similarity: 1,
    },
    zip: {
      value: '30019',
      confidence: 0.9998251795768738,
      bbox: {
        x_min: '0.4684053308823529',
        y_min: '0.1103515625',
        x_max: '0.5164292279411765',
        y_max: '0.1259765625',
      },
      page: 1,
      similarity: 1,
    },
    phone_number: {
      value: null,
    },
  },
  bill_to: {
    bill_to_company: {
      value: 'Hebron Christian Academy',
      confidence: 0.922877848148346,
      bbox: {
        x_min: '0.6238511029411765',
        y_min: '0.32421875',
        x_max: '0.8336397058823529',
        y_max: '0.33984375',
      },
      page: 1,
      similarity: 1,
    },
    bill_to_name: {
      value: 'Cory Johns',
      confidence: 0.9416682720184326,
      bbox: {
        x_min: '0.6630284926470589',
        y_min: '0.3447265625',
        x_max: '0.7540211397058824',
        y_max: '0.3603515625',
      },
      page: 1,
      similarity: 1,
    },
    attn: {
      value: null,
    },
    street: {
      value: '775 Dacula Rd',
      confidence: 0.9995454947153727,
      bbox: {
        x_min: '0.6213235294117647',
        y_min: '0.36328125',
        x_max: '0.7413832720588236',
        y_max: '0.37890625',
      },
      page: 1,
      similarity: 1,
    },
    city: {
      value: 'Dacula',
      confidence: 0.9987044334411621,
      bbox: {
        x_min: '0.6579733455882353',
        y_min: '0.365234375',
        x_max: '0.7123161764705882',
        y_max: '0.376953125',
      },
      page: 1,
      similarity: 1,
    },
    state: {
      value: 'GA',
      confidence: 0.9005885124206543,
      bbox: {
        x_min: '0.6870404411764706',
        y_min: '0.384765625',
        x_max: '0.7161075367647058',
        y_max: '0.3974609375',
      },
      page: 1,
      similarity: 1,
    },
    zip: {
      value: '30019',
      confidence: 0.999845027923584,
      bbox: {
        x_min: '0.71484375',
        y_min: '0.3837890625',
        x_max: '0.7679227941176471',
        y_max: '0.3984375',
      },
      page: 1,
      similarity: 1,
    },
    phone_number: {
      value: null,
    },
  },
  line_items: [
    {
      sku_number: {
        value: 'CLI-80110-60',
        confidence: 0.9937126040458679,
        bbox: {
          x_min: '0.091796875',
          y_min: '0.52734375',
          x_max: '0.18152573529411764',
          y_max: '0.5380859375',
        },
        page: 1,
        similarity: 1,
      },
      rehab_id: {
        value: null,
      },
      description: {
        value: 'Power Adult Changing Table with Open Base by Clinton Industries Power Changing Table Models - 60-inch Changing Table',
      },
      quantity: {
        value: 1,
      },
      unit_price: {
        value: '1699.33',
        confidence: 0.9996626377105713,
        bbox: {
          x_min: '0.7173713235294118',
          y_min: '0.52734375',
          x_max: '0.7830882352941176',
          y_max: '0.5390625',
        },
        page: 1,
        similarity: 1,
      },
      total_price: {
        value: '1699.33',
        confidence: 0.9996626377105713,
        bbox: {
          x_min: '0.7173713235294118',
          y_min: '0.52734375',
          x_max: '0.7830882352941176',
          y_max: '0.5390625',
        },
        page: 1,
        similarity: 1,
      },
    },
    {
      sku_number: {
        value: 'CLI-RESBUS',
        confidence: 0.9964452385902405,
        bbox: {
          x_min: '0.0930606617647059',
          y_min: '0.576171875',
          x_max: '0.18026194852941174',
          y_max: '0.587890625',
        },
        page: 1,
        similarity: 1,
      },
      rehab_id: {
        value: null,
      },
      description: {
        value:
          'Power Adult Changing Table with Open Base by Clinton Industries Delivery Method - Lift Gate - Ship to My Home Address or Business Facility without Receiving Dock - Curbside Delivery',
      },
      quantity: {
        value: 1,
      },
      unit_price: {
        value: '675.0',
        confidence: 0.9988945126533508,
        bbox: {
          x_min: '0.7274816176470589',
          y_min: '0.5751953125',
          x_max: '0.7843520220588236',
          y_max: '0.58984375',
        },
        page: 1,
        similarity: 1,
      },
      total_price: {
        value: '675.0',
        confidence: 0.9988945126533508,
        bbox: {
          x_min: '0.7274816176470589',
          y_min: '0.5751953125',
          x_max: '0.7843520220588236',
          y_max: '0.58984375',
        },
        page: 1,
        similarity: 1,
      },
    },
  ],
  subtotal: {
    value: '2374.33',
    confidence: 0.9997127652168274,
    bbox: {
      x_min: '0.84375',
      y_min: '0.6728515625',
      x_max: '0.9119944852941176',
      y_max: '0.6875',
    },
    page: 1,
    similarity: 1,
  },
  tax: {
    value: '0.0',
    confidence: 0.9994858503341675,
    bbox: {
      x_min: '0.8728170955882353',
      y_min: '0.6142578125',
      x_max: '0.9107306985294117',
      y_max: '0.6259765625',
    },
    page: 1,
    similarity: 1,
  },
  shipping_cost: {
    value: '301.19',
    confidence: 0.999962329864502,
    bbox: {
      x_min: '0.8563878676470589',
      y_min: '0.6943359375',
      x_max: '0.9107306985294117',
      y_max: '0.7060546875',
    },
    page: 1,
    similarity: 1,
  },
  discount: {
    value: '0.0',
    confidence: 0.9994858503341675,
    bbox: {
      x_min: '0.8728170955882353',
      y_min: '0.6142578125',
      x_max: '0.9107306985294117',
      y_max: '0.6259765625',
    },
    page: 1,
    similarity: 1,
  },
  total_amount: {
    value: '2675.52',
    confidence: 0.9994283318519592,
    bbox: {
      x_min: '0.8450137867647058',
      y_min: '0.7353515625',
      x_max: '0.9107306985294117',
      y_max: '0.7470703125',
    },
    page: 1,
    similarity: 1,
  },
  quote_id: {
    value: 'QT61005MD',
    confidence: 0.997958779335022,
    bbox: {
      x_min: '0.0930606617647059',
      y_min: '0.4658203125',
      x_max: '0.18531709558823528',
      y_max: '0.4775390625',
    },
    page: 1,
    similarity: 1,
  },
};
