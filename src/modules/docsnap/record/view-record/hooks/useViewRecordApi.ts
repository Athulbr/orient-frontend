import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from '../utils';
import { useS3DocumentsStore } from '../../../../../zustand-store/useStoredDocuments';

export const useViewRecordApi = () => {
  const { state, setState } = useViewRecordState();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { getS3File } = useS3DocumentsStore();

  // ============================= Get Record By Id ==================================

  const getAndConvertDocumentToImage = async (pdfFileName: string) => {
    setState(prev => ({ ...prev, loadingS3File: true }));
    const s3Response = await getS3File(pdfFileName);
    const imageData = s3Response?.data?.Body?.data;
    if (!imageData) {
      toast.error('S3 document not found');
      return;
    }
    const uint8Array = new Uint8Array(imageData);
    const getFileType = await fileTypeFromBuffer(uint8Array);
    let pdfFile: any;
    let imageUrlArray;
    if (getFileType?.mime && getFileType?.mime !== 'application/pdf') {
      pdfFile = await binaryToFile(uint8Array, `image.${getFileType.ext}`, getFileType?.mime);
      imageUrlArray = [URL.createObjectURL(pdfFile).toString()];
    } else {
      pdfFile = await binaryToFile(uint8Array, `document.${getFileType?.ext}`, getFileType?.mime);
      imageUrlArray = await convertPdfToImages(pdfFile);
    }

    setState(prev => ({ ...prev, loadingS3File: false, images: imageUrlArray }));
  };

  const getRecordApiById = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/history/${id}`);

      getAndConvertDocumentToImage(res.data.pdfFileName);
      const objectFields: Record<string, any> = {};
      const arrayFields: Record<string, any>[] = [];
      const tableNames: string[] = [];
      if (res.data.extractedData) {
        const extractedData = JSON.parse(JSON.stringify(res.data.extractedData));
        // const extractedData = sampleExtractedData;
        Object.entries(extractedData).forEach(([key, value]: any) => {
          if (Array.isArray(value)) {
            // its array
            arrayFields.push(value);
            tableNames.push(key);
          } else if (typeof value === 'object' && value !== null && value?.value === undefined) {
            // its object
            objectFields[key] = value;
          }
        });
      }
      setState(prev => ({ ...prev, record: res.data, objectFields, arrayFields, tableNames, loadingData: false }));
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to get Record');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };

  const sendMessage = async (message: string) => {
    setState(prev => ({
      ...prev,
      chatLoading: true,
      messages: [
        ...prev.messages,
        {
          text: message,
          userMessage: true,
        },
      ],
    }));

    const requestBody = {
      query: message,
      botName: state.record?.pdfFileName,
    };

    const response: any = await httpRequest('POST', `https://demo.makez.ai/chatbot/query`, requestBody);

    setState(prev => ({
      ...prev,
      chatLoading: false,
      messages: [
        ...prev.messages,
        {
          text: response.answer,
          source: response.source_documents,
          userMessage: false,
        },
      ],
    }));
  };

  const submitRecordApi = async () => {
    try {
      const payload = {
        apiResponse: state?.record?.extractedData,
        recordId: state?.record?._id,
        extractedData: { ...state?.objectFields, line_items: state?.arrayFields[0] },
        name: state?.record?.name,
      };
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/rehab/create`, payload);
      toast.success('Record submitted successfully');
      navigate('/docsnap/record/list');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Record');
      navigate('/docsnap/record/list');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };

  const updateRecordApiById = async () => {
    try {
      const payload = {
        template: state?.record?.templateId,
        extractedData: state?.record?.extractedData,
        metadata: state?.record?.metadata,
        fileName: state?.record?.name,
        updatedData: { ...state?.objectFields, line_items: state?.arrayFields[0] },
      };

      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, payload);
      toast.success('Record updated successfully');
      navigate('/');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Record');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };
  const updateExtractedData = async (extractedData: any) => {
    try {
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, { extractedData });
      toast.success('Record updated successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Record');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };
  const generateInvoiceWithAI = async () => {
    try {
      const filteredData = filterExtractedDataForInvoiceGeneration(state.record?.extractedData);
      setState(prev => ({ ...prev, generatingInvoice: true }));
      // test
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/generate-invoice`, {
        purchaseOrder: filteredData,
      });
      setState(prev => ({ ...prev, invoiceContent: res.invoice || 'Error generating invoice' }));
      toast.success('Invoice generated successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to generate Invoice');
    } finally {
      setState(prev => ({ ...prev, generatingInvoice: false }));
    }
  };
  const createRequestedNewField = async (description: string) => {
    try {
      const requestBody = {
        description,
        requestType: 'field',
        document: state.record?.templateId._id, // TODO: update this
      };
      setState(prev => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/request/create`, requestBody);
      toast.success('Request created successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create Request');
    } finally {
      setState(prev => ({ ...prev, creatingRequest: false, requestNewFieldDialog: false }));
    }
  };
  const createComment = async (comment: string, jsonKey: string) => {
    try {
      const requestBody = {
        jsonKey,
        comment,
        templateId: state.record?.templateId._id,
      };
      setState(prev => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/comment/create`, requestBody);

      toast.success('Comment created successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create Comment');
    } finally {
      setState(prev => ({ ...prev, creatingRequest: false }));
      return true;
    }
  };

  return {
    getRecordApiById,
    sendMessage,
    updateRecordApiById,
    submitRecordApi,
    updateExtractedData,
    generateInvoiceWithAI,
    createRequestedNewField,
    createComment,
  };
};

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
  const blob = new Blob([binaryData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

const sampleExtractedData = {
  basic_info: {
    po_number: {
      value: 'HC7536',
      bbox: {
        x_min: 0.7717647059,
        y_min: 0.2272727273,
        x_max: 0.8282352941,
        y_max: 0.2363636364,
      },
      page: 1,
      confidence: 0.9889,
    },
    contact_email: {
      value: 'purchasing@hebronlions.org',
      bbox: {
        x_min: 0.622745098,
        y_min: 0.4048484848,
        x_max: 0.8478431373,
        y_max: 0.4193939394,
      },
      page: 1,
      confidence: 0.9863,
    },
    phone_number: {
      value: '(770) 963-9250',
      bbox: {
        x_min: 0.3952941176,
        y_min: 0.8527272727,
        x_max: 0.4925490196,
        y_max: 0.8636363636,
      },
      page: 1,
      confidence: 0.9783,
    },
    subtotal: {
      value: 2374.33,
      bbox: {
        x_min: 0.8525490196,
        y_min: 0.6757575758,
        x_max: 0.9074509804,
        y_max: 0.6836363636,
      },
      page: 1,
      confidence: 0.9545,
    },
    tax: {
      value: 0,
      bbox: {
        x_min: 0.8807843137,
        y_min: 0.7151515152,
        x_max: 0.9082352941,
        y_max: 0.7236363636,
      },
      page: 1,
      confidence: 0.9905,
    },
    shipping_cost: {
      value: 301.19,
      bbox: {
        x_min: 0.8650980392,
        y_min: 0.6951515152,
        x_max: 0.9074509804,
        y_max: 0.703030303,
      },
      page: 1,
      confidence: 0.9845,
    },
    total_amount: {
      value: 2675.52,
      bbox: {
        x_min: 0.8533333333,
        y_min: 0.7351515152,
        x_max: 0.9082352941,
        y_max: 0.7454545455,
      },
      page: 1,
      confidence: 0.9893,
    },
    quote_id: {
      value: 'QT61005MD',
      bbox: {
        x_min: 0.0925490196,
        y_min: 0.4678787879,
        x_max: 0.182745098,
        y_max: 0.4763636364,
      },
      page: 1,
      confidence: 0.9753,
    },
  },
  ship_to: {
    name: {
      value: 'Hebron Christian Academy',
      bbox: {
        x_min: 0.0933333333,
        y_min: 0.3248484848,
        x_max: 0.302745098,
        y_max: 0.336969697,
      },
      page: 1,
      confidence: 0.9761,
    },
    attn: {
      value: 'Cassie Snow',
      bbox: {
        x_min: 0.137254902,
        y_min: 0.3460606061,
        x_max: 0.2392156863,
        y_max: 0.3557575758,
      },
      page: 1,
      confidence: 0.9638,
    },
    street: {
      value: '2965 Old Peachtree Rd',
      bbox: {
        x_min: 0.0925490196,
        y_min: 0.3660606061,
        x_max: 0.2752941176,
        y_max: 0.3757575758,
      },
      page: 1,
      confidence: 0.9835,
    },
    city: {
      value: 'Dacula',
      bbox: {
        x_min: 0.0933333333,
        y_min: 0.3848484848,
        x_max: 0.1458823529,
        y_max: 0.3975757576,
      },
      page: 1,
      confidence: 0.9889,
    },
    state: {
      value: 'GA',
      bbox: {
        x_min: 0.1568627451,
        y_min: 0.3848484848,
        x_max: 0.1803921569,
        y_max: 0.3963636364,
      },
      page: 1,
      confidence: 0.9846,
    },
    zip: {
      value: '30019',
      bbox: {
        x_min: 0.1850980392,
        y_min: 0.3836363636,
        x_max: 0.2337254902,
        y_max: 0.3963636364,
      },
      page: 1,
      confidence: 0.9821,
    },
  },
  bill_to: {
    name: {
      value: 'Hebron Christian Academy',
      bbox: {
        x_min: 0.6235294118,
        y_min: 0.3242424242,
        x_max: 0.8321568627,
        y_max: 0.3381818182,
      },
      page: 1,
      confidence: 0.9744,
    },
    attn: {
      value: 'Cory Johns',
      bbox: {
        x_min: 0.662745098,
        y_min: 0.3460606061,
        x_max: 0.7521568627,
        y_max: 0.3581818182,
      },
      page: 1,
      confidence: 0.975,
    },
    street: {
      value: '775 Dacula Rd',
      bbox: {
        x_min: 0.622745098,
        y_min: 0.3660606061,
        x_max: 0.7388235294,
        y_max: 0.3757575758,
      },
      page: 1,
      confidence: 0.9835,
    },
    city: {
      value: 'Dacula',
      bbox: {
        x_min: 0.622745098,
        y_min: 0.3848484848,
        x_max: 0.6768627451,
        y_max: 0.3975757576,
      },
      page: 1,
      confidence: 0.9887,
    },
    state: {
      value: 'GA',
      bbox: {
        x_min: 0.6870588235,
        y_min: 0.3848484848,
        x_max: 0.7105882353,
        y_max: 0.396969697,
      },
      page: 1,
      confidence: 0.9866,
    },
    zip: {
      value: '30019',
      bbox: {
        x_min: 0.7160784314,
        y_min: 0.3842424242,
        x_max: 0.7639215686,
        y_max: 0.396969697,
      },
      page: 1,
      confidence: 0.9797,
    },
  },
  line_items: [
    {
      sku_number: {
        value: 'CLI-80110-60',
        bbox: {
          x_min: 0.0925490196,
          y_min: 0.5290909091,
          x_max: 0.1788235294,
          y_max: 0.5363636364,
        },
        page: 1,
        confidence: 0.9842,
      },
      description: {
        value: 'Power Adult Changing Table with Open Base by Clinton Industries Power Changing Table Models - 60-inch Changing Table',
        bbox: {
          x_min: 0.2650980392,
          y_min: 0.5157575758,
          x_max: 0.6078431373,
          y_max: 0.5521212121,
        },
        page: 1,
        confidence: 0.9845,
      },
      quantity: {
        value: 1,
        bbox: {
          x_min: 0.6768627451,
          y_min: 0.5290909091,
          x_max: 0.6823529412,
          y_max: 0.5357575758,
        },
        page: 1,
        confidence: 0.9636,
      },
      unit_price: {
        value: 1699.33,
        bbox: {
          x_min: 0.7176470588,
          y_min: 0.5284848485,
          x_max: 0.7811764706,
          y_max: 0.5375757576,
        },
        page: 1,
        confidence: 0.9722,
      },
      total_price: {
        value: 1699.33,
        bbox: {
          x_min: 0.8454901961,
          y_min: 0.5290909091,
          x_max: 0.9074509804,
          y_max: 0.5363636364,
        },
        page: 1,
        confidence: 0.9748,
      },
    },
    {
      sku_number: {
        value: 'CLI-RESBUS',
        bbox: {
          x_min: 0.0925490196,
          y_min: 0.5781818182,
          x_max: 0.177254902,
          y_max: 0.5860606061,
        },
        page: 1,
        confidence: 0.9813,
      },
      description: {
        value:
          'Power Adult Changing Table with Open Base by Clinton Industries Delivery Method - Lift Gate - Ship to My Home Address or Business Facility without Receiving Dock - Curbside Delivery',
        bbox: {
          x_min: 0.2650980392,
          y_min: 0.5587878788,
          x_max: 0.4909803922,
          y_max: 0.6072727273,
        },
        page: 1,
        confidence: 0.9812,
      },
      quantity: {
        value: 1,
        bbox: {
          x_min: 0.6768627451,
          y_min: 0.5781818182,
          x_max: 0.6831372549,
          y_max: 0.5854545455,
        },
        page: 1,
        confidence: 0.9698,
      },
      unit_price: {
        value: 675,
        bbox: {
          x_min: 0.7294117647,
          y_min: 0.5781818182,
          x_max: 0.7803921569,
          y_max: 0.5860606061,
        },
        page: 1,
        confidence: 0.9821,
      },
      total_price: {
        value: 675,
        bbox: {
          x_min: 0.857254902,
          y_min: 0.5781818182,
          x_max: 0.9090196078,
          y_max: 0.5866666667,
        },
        page: 1,
        confidence: 0.98115,
      },
    },
  ],
};
