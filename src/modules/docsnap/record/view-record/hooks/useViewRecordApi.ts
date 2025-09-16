import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from '../utils';
import { useS3Storage } from '../../../../../zustand-store/S3Storage';

export const useViewRecordApi = () => {
  const { state, setState } = useViewRecordState();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { getS3File } = useS3Storage();

  // ============================= Get Record By Id ==================================

  const getAndConvertDocumentToImage = async (pdfFileName: string) => {
    setState(prev => ({ ...prev, loadingS3File: true }));
    const s3Response: any = await getS3File(pdfFileName);
    const imageData = s3Response?.Body?.data;
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

    setState(prev => ({
      ...prev,
      loadingS3File: false,
      images: imageUrlArray
    }));
  };

  const getRecordApiById = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/history/${id}`);
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
      setState(prev => ({
        ...prev,
        record: res.data,
        objectFields,
        arrayFields,
        tableNames,
        loadingData: false
      }));
      if (res.data?.imageFileNames?.length > 0) {
        const images = await Promise.all(res.data?.imageFileNames?.map((fileName: string) => getS3File(fileName)));
        console.log('images', images);
        setState(prev => ({
          ...prev,
          loadingS3File: false,
          images: images.map((image: any) => URL.createObjectURL(new Blob([new Uint8Array(image.Body.data)], { type: 'image/jpeg' })))
        }));
      } else {
        getAndConvertDocumentToImage(res.data.pdfFileName);
      }

    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to get Record');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };

  const sendMessage = async (message: string) => {
    setState(prev => ({ ...prev, chatLoading: true, messages: [...prev.messages, { text: message, userMessage: true }] }));
    const requestBody = { query: message, botName: state.record?.pdfFileName };
    const response: any = await httpRequest('POST', `${import.meta.env.VITE_PYTHON_URL}/chatbot/v2/query`, requestBody);
    setState(prev => ({
      ...prev,
      chatLoading: false,
      messages: [...prev.messages, { text: response.answer, source: response.source_documents, userMessage: false }]
    }));
  };
  const sendMessageToNode = async (query: string) => {
    setState(prev => ({ ...prev, chatLoading: true, messages: [...prev.messages, { text: query, userMessage: true }] }));
    const requestBody = { query, visionOcrText: state.record?.visionOcrText, chatList: state.messages };
    const response: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/project/send-message`, requestBody);
    setState(prev => ({
      ...prev,
      chatLoading: false,
      messages: [...prev.messages, { text: response.data.response, userMessage: false }]
    }));
  };

  const submitRecordApi = async () => {
    try {
      const payload = {
        apiResponse: state?.record?.extractedData,
        recordId: state?.record?._id,
        extractedData: {
          ...state?.objectFields,
          line_items: state?.arrayFields[0]
        },
        name: state?.record?.name
      };
      setState(prev => ({ ...prev, loadingData: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/history/rehab/create`, payload);
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
      // Convert arrayFields[0] (Record<string, Record<string, { value: string }>>) to array of row objects
      const lineItemsRecord = state?.arrayFields[0] || {};
      const lineItemsArray = Object.values(lineItemsRecord).map(rowObj => {
        const flatRow: Record<string, any> = {};
        Object.entries(rowObj).forEach(([col, valObj]) => {
          // Copy all properties (value, page, bbox, confidence, etc.)
          flatRow[col] = { ...valObj };
        });
        return flatRow;
      });
      const payload = {
        template: state?.record?.templateId,
        extractedData: state?.record?.extractedData,
        metadata: state?.record?.metadata,
        fileName: state?.record?.name,
        updatedData: {
          ...state?.objectFields,
          line_items: lineItemsArray
        }
      };
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/idp/history/update/${id}`, payload);
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
      const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/idp/history/update/${id}`, { extractedData });
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
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/history/generate-invoice`, {
        purchaseOrder: filteredData
      });
      setState(prev => ({
        ...prev,
        invoiceContent: res.invoice || 'Error generating invoice'
      }));
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
        document: state.record?.templateId._id // TODO: update this
      };
      setState(prev => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/request/create`, requestBody);
      toast.success('Request created successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create Request');
    } finally {
      setState(prev => ({
        ...prev,
        creatingRequest: false,
        requestNewFieldDialog: false
      }));
    }
  };
  const createComment = async (comment: string, jsonKey: string) => {
    try {
      const requestBody = {
        jsonKey,
        comment,
        templateId: state.record?.templateId._id
      };
      setState(prev => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/comment/create`, requestBody);

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
    sendMessageToNode
  };
};

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
  const blob = new Blob([binaryData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

const visionOcrText = [
  'RehabMart\nTools for the job of living\nwww.rehabmart.com\nOFFICIAL QUOTE\n3651 Mars Hill Rd, Bldg 2400\nWatkinsville, GA 30677\nDate\n7/8/2025\nQuote ID\nQT66607MD\nQuotes Dept: RFQ@rehabmart.com Submit Your PO: QuotePO@rehabmart.com\nBill To\nShip To\nBirmingham VA Medical Center\nSohini Parekh\n700 19th St S\nBirmingham, AL 35294-1927\nRM Rep\nSHIP DATE\nSHIP VIA\nMD\nQty Item Code / $ Amount / Product Description\nBirmingham VA Medical Center\nSohini Parekh\n700 19th St S\nBirmingham, AL 35294-1927\nQUOTE VALID FOR\n30 Days Subject to product availability\nHAU-1428-47-113 --> $5,176.00 Hausmann Hi-Lo Bariatric Mat\nTable with Power Backrest Hausmann Hi-Lo Bariatric Mat Table\nwith Power Backrest - 4 ft. x 7 ft. Bariatric Mat Table with Blue\nUpholstery\nHAU-LOADDOCK --> $450.00 Hausmann Hi-Lo Bariatric Mat\nTable with Power Backrest Delivery Method - Dock-to-Dock\nLoad Dock Delivery (Delivery Driver Will NOT Unload Items)\nFor Businesses with Loading Docks\nProduct URL: https://www.rehabmart.com/product/46255.html\nPrice Each\nAmount\n5,626.00\n5,626.00\nConvenient ways to place your order:\nSubtotal:\n$5,626.00\nCheckout Online at Rehabmart.com using your Custom Quote Code:\nQT66607MD\nCopy/paste this code in shopping cart or use this link:\nhttps://www.rehabmart.com/quotes/QT66607MD\n-\nEmail Your Purchase Order to QuotePO@rehabmart.com\nFax Your Purchase Order to 678-254-1791\nMail a check (payable to Rehabmart.com) for the full amount to the\naddress listed above. Please include your quote number on your check\nand/or a copy of your quote document.\n- ACH Payment Transfer:\nCompany Name: Rehabmart.com\nBank Name: Pinnacle Bank\nRouting Account Number: 061101294\nChecking Account Number: 100031657\nSales Tax:\n$0.00\nPinnacle Bank Phone # 706-283-2854Lift Gate Disclaimer: The\nproduct(s) listed in this quote were quoted for standard freight/',
  'loading dock delivery. If your delivery location does not have a\nloading dock, then your product(s) must be transferred at the shipping\nterminal from a box trailer truck to a lift gate truck, which is a\nhydraulic-powered platform that moves freight up and down from the\nrear of the truck. The lift gate delivery charge is $250, and this charge\nmust be paid by the customer prior to product delivery.\nAdditional freight costs may apply to your order at the time of\npurchasing your quoted items. Read more:\nhttps://www.rehabmart.com/quotes.asp\nPlease verify the products listed above to confirm this quote represents\nthe exact products you intend to purchase. Make color choices, fabric\nchoices, and choose applicable product options before submitting your\nfinal order.\nTotal:\n$5,626.00\nReturn Policy Notification: All purchase orders are subject to the return policy, order policy, pricing\nerrors policy and restocking fee policy. Please review all Rehabmart policies by visiting our policy\npage at: https://www.rehabmart.com/policies/\nRehabmart.com\nFederal Tax ID: 58-2515167\nSBA Customer ID: P1002610\nHub Zone Certification # 39450\nDUNS #051112832\nGSA 65IIA Contract # 36F79725D0088\nGSA 651IF Contract # 36F79723D0029\nCAGE Code: 56Z51\nQuestions? Quotes Team: RFQ@rehabmart.com | Call: 706-213-1144 / 800-827-8283 | Fax:\n678-254-1791\nTHANK YOU FOR CONSIDERING REHABMART.COM'
];

const sampleExtractedData = {
  "basic_details": {
    "purchase_agent": {
      "value": "Andrea Lavell Myers",
      "page": 2,
      "row": 5,
      "bbox": {
        "x_min": 0.2818396226,
        "y_min": 0.1227217497,
        "x_max": 0.4382861635,
        "y_max": 0.1354799514
      },
      "confidence": 0.9776,
      "spaceSeperatedFirstWord": "ANDREA",
      "spaceSeperatedLstWord": "MYERS"
    },
    "contact_email": {
      "value": "andrea.myers5@va.gov",
      "page": 2,
      "row": 7,
      "bbox": {
        "x_min": 0.2000786164,
        "y_min": 0.1810449575,
        "x_max": 0.4068396226,
        "y_max": 0.1956257594
      },
      "confidence": 0.9797
    },
    "po_number": {
      "value": "573-5F9823",
      "page": 2,
      "row": 11,
      "bbox": {
        "x_min": 0.1301100629,
        "y_min": 0.2961725395,
        "x_max": 0.2366352201,
        "y_max": 0.3068043742
      },
      "confidence": 0.9885
    },
    "from_location": {
      "value": "GAINESVILLE VAMC",
      "page": 2,
      "row": 2,
      "bbox": {
        "x_min": 0.0652515723,
        "y_min": 0.054981774,
        "x_max": 0.2150157233,
        "y_max": 0.0722964763
      },
      "confidence": 0.9931,
      "spaceSeperatedFirstWord": "GAINESVILLE",
      "spaceSeperatedLstWord": "GAINESVILLE"
    },
    "contract_number": {
      "value": "",
      "page": 0,
      "row": 0
    },
    "quote_id": {
      "value": "",
      "page": 0,
      "row": 0
    },
    "subtotal": {
      "value": "983.13",
      "page": 3,
      "row": 28,
      "bbox": {
        "x_min": 0.8294025157,
        "y_min": 0.6254556501,
        "x_max": 0.8789308176,
        "y_max": 0.6363912515
      },
      "confidence": 0.9907
    },
    "tax": {
      "value": "",
      "page": 0,
      "row": 0
    },
    "total_amount": {
      "value": "983.13",
      "page": 3,
      "row": 29,
      "bbox": {
        "x_min": 0.829009434,
        "y_min": 0.6470230863,
        "x_max": 0.8785377358,
        "y_max": 0.6573511543
      },
      "confidence": 0.9851
    },
    "discount": {
      "value": "0.00",
      "page": 3,
      "row": 29,
      "bbox": {
        "x_min": 0.3746069182,
        "y_min": 0.6482381531,
        "x_max": 0.4072327044,
        "y_max": 0.6579586877
      },
      "confidence": 0.9869
    },
    "shipping_cost": {
      "value": "0.00",
      "page": 3,
      "row": 29,
      "bbox": {
        "x_min": 0.6383647799,
        "y_min": 0.6461117861,
        "x_max": 0.6674528302,
        "y_max": 0.6579586877
      },
      "confidence": 0.9854
    }
  },
  "bill_to": {
    "bill_to_name": {
      "value": "Andrea Lavell Myers",
      "page": 2,
      "row": 5,
      "bbox": {
        "x_min": 0.2818396226,
        "y_min": 0.1227217497,
        "x_max": 0.4382861635,
        "y_max": 0.1354799514
      },
      "confidence": 0.9776,
      "spaceSeperatedFirstWord": "ANDREA",
      "spaceSeperatedLstWord": "MYERS"
    },
    "street": {
      "value": "1601 SW ARCHER ROAD",
      "page": 2,
      "row": 3,
      "bbox": {
        "x_min": 0.0656446541,
        "y_min": 0.0808019441,
        "x_max": 0.2955974843,
        "y_max": 0.0920413123
      },
      "confidence": 0.9907,
      "spaceSeperatedFirstWord": "1601",
      "spaceSeperatedLstWord": "ROAD"
    },
    "city": {
      "value": "Gainesville",
      "page": 2,
      "row": 4,
      "bbox": {
        "x_min": 0.0652515723,
        "y_min": 0.1023693803,
        "x_max": 0.1922169811,
        "y_max": 0.1148238153
      },
      "confidence": 0.993,
      "spaceSeperatedFirstWord": "GAINESVILLE",
      "spaceSeperatedLstWord": "GAINESVILLE"
    },
    "state": {
      "value": "FL",
      "page": 2,
      "row": 4,
      "bbox": {
        "x_min": 0.2051886792,
        "y_min": 0.1023693803,
        "x_max": 0.2279874214,
        "y_max": 0.1148238153
      },
      "confidence": 0.9684
    },
    "zip": {
      "value": "32608",
      "page": 2,
      "row": 4,
      "bbox": {
        "x_min": 0.2382075472,
        "y_min": 0.1023693803,
        "x_max": 0.2924528302,
        "y_max": 0.1148238153
      },
      "confidence": 0.9834
    },
    "phone_number": {
      "value": "3867193273 x3273",
      "page": 2,
      "row": 6,
      "bbox": {
        "x_min": 0.2063679245,
        "y_min": 0.1613001215,
        "x_max": 0.3738207547,
        "y_max": 0.1731470231
      },
      "confidence": 0.9886,
      "spaceSeperatedFirstWord": "3867193273",
      "spaceSeperatedLstWord": "x3273"
    },
    "bill_to_company": {
      "value": "GAINESVILLE VAMC",
      "page": 2,
      "row": 2,
      "bbox": {
        "x_min": 0.0652515723,
        "y_min": 0.054981774,
        "x_max": 0.2150157233,
        "y_max": 0.0722964763
      },
      "confidence": 0.9931,
      "spaceSeperatedFirstWord": "GAINESVILLE",
      "spaceSeperatedLstWord": "GAINESVILLE"
    }
  },
  "ship_to": {
    "ship_to_company": {
      "value": "",
      "page": 0,
      "row": 0
    },
    "name": {
      "value": "Harry McKinley Warren",
      "page": 3,
      "row": 15,
      "bbox": {
        "x_min": 0.0668238994,
        "y_min": 0.3113608748,
        "x_max": 0.2028301887,
        "y_max": 0.3229040097
      },
      "confidence": 0.9909,
      "spaceSeperatedFirstWord": "HARRY",
      "spaceSeperatedLstWord": "WARREN"
    },
    "street": {
      "value": "86079 CARDINAL ROAD",
      "page": 3,
      "row": 17,
      "bbox": {
        "x_min": 0.0676100629,
        "y_min": 0.3502430134,
        "x_max": 0.2441037736,
        "y_max": 0.3590522479
      },
      "confidence": 0.9887,
      "spaceSeperatedFirstWord": "86079",
      "spaceSeperatedLstWord": "ROAD"
    },
    "city": {
      "value": "Yulee",
      "page": 3,
      "row": 18,
      "bbox": {
        "x_min": 0.0664308176,
        "y_min": 0.3630012151,
        "x_max": 0.1128144654,
        "y_max": 0.3736330498
      },
      "confidence": 0.9911,
      "spaceSeperatedFirstWord": "YULEE",
      "spaceSeperatedLstWord": "YULEE"
    },
    "state": {
      "value": "FL",
      "page": 3,
      "row": 18
    },
    "zip": {
      "value": "32097",
      "page": 3,
      "row": 18,
      "bbox": {
        "x_min": 0.205581761,
        "y_min": 0.3623936817,
        "x_max": 0.2511792453,
        "y_max": 0.3730255164
      },
      "confidence": 0.9908
    },
    "phone_number": {
      "value": "(904) 225-2207",
      "page": 3,
      "row": 19,
      "bbox": {
        "x_min": 0.0668238994,
        "y_min": 0.3766707169,
        "x_max": 0.185927673,
        "y_max": 0.3869987849
      },
      "confidence": 0.9816,
      "spaceSeperatedFirstWord": "(",
      "spaceSeperatedLstWord": "225-2207"
    }
  },
  "card_info": {
    "name": {
      "value": "",
      "page": 0,
      "row": 0
    },
    "card_number": {
      "value": "4716400003889226",
      "page": 3,
      "row": 35,
      "bbox": {
        "x_min": 0.0558176101,
        "y_min": 0.7904009721,
        "x_max": 0.205581761,
        "y_max": 0.7992102066
      },
      "confidence": 0.9907
    },
    "expiration_date": {
      "value": "2/28",
      "page": 4,
      "row": 21,
      "bbox": {
        "x_min": 0.2617924528,
        "y_min": 0.5036452005,
        "x_max": 0.2940251572,
        "y_max": 0.5130619684
      },
      "confidence": 0.9819
    },
    "cvv": {
      "value": "672",
      "page": 4,
      "row": 22,
      "bbox": {
        "x_min": 0.233490566,
        "y_min": 0.5185297691,
        "x_max": 0.2617924528,
        "y_max": 0.5273390036
      },
      "confidence": 0.9878
    }
  },
  "line_items": [
    {
      "sku_number": {
        "value": "STI-5850",
        "page": 4,
        "row": 15,
        "bbox": {
          "x_min": 0.1383647799,
          "y_min": 0.3465978129,
          "x_max": 0.205581761,
          "y_max": 0.3563183475
        },
        "confidence": 0.9768,
        "spaceSeperatedFirstWord": "STI",
        "spaceSeperatedLstWord": "5850"
      },
      "rehab_id": {
        "value": "",
        "page": 0,
        "row": 0
      },
      "description": {
        "value": "BED SAFETY FROM STANDER",
        "page": 4,
        "row": 15,
        "bbox": {
          "x_min": 0.2130503145,
          "y_min": 0.3465978129,
          "x_max": 0.4496855346,
          "y_max": 0.3563183475
        },
        "confidence": 0.9907,
        "spaceSeperatedFirstWord": "BED",
        "spaceSeperatedLstWord": "STANDER"
      },
      "quantity": {
        "value": "1",
        "page": 4,
        "row": 15,
        "bbox": {
          "x_min": 0.5978773585,
          "y_min": 0.3472053463,
          "x_max": 0.6037735849,
          "y_max": 0.3554070474
        },
        "confidence": 0.9397
      },
      "unit_price": {
        "value": "155.37",
        "page": 4,
        "row": 15,
        "bbox": {
          "x_min": 0.7822327044,
          "y_min": 0.3462940462,
          "x_max": 0.830581761,
          "y_max": 0.3557108141
        },
        "confidence": 0.9861
      },
      "total_price": {
        "value": "155.37",
        "page": 4,
        "row": 15,
        "bbox": {
          "x_min": 0.8922955975,
          "y_min": 0.3459902795,
          "x_max": 0.9402515723,
          "y_max": 0.3557108141
        },
        "confidence": 0.9846
      }
    },
    {
      "sku_number": {
        "value": "SLB-SB6C",
        "page": 4,
        "row": 16,
        "bbox": {
          "x_min": 0.1383647799,
          "y_min": 0.379708384,
          "x_max": 0.1690251572,
          "y_max": 0.3894289186
        },
        "confidence": 0.9834,
        "spaceSeperatedFirstWord": "SLB",
        "spaceSeperatedLstWord": "SLB"
      },
      "rehab_id": {
        "value": "",
        "page": 0,
        "row": 0
      },
      "description": {
        "value": "SHOWER BUDDY ROLL-IN BUDDY LITE",
        "page": 4,
        "row": 16,
        "bbox": {
          "x_min": 0.2291666667,
          "y_min": 0.379708384,
          "x_max": 0.5357704403,
          "y_max": 0.3894289186
        },
        "confidence": 0.9919,
        "spaceSeperatedFirstWord": "SHOWER",
        "spaceSeperatedLstWord": "LITE"
      },
      "quantity": {
        "value": "1",
        "page": 4,
        "row": 16,
        "bbox": {
          "x_min": 0.5978773585,
          "y_min": 0.3806196841,
          "x_max": 0.6033805031,
          "y_max": 0.3891251519
        },
        "confidence": 0.9319
      },
      "unit_price": {
        "value": "760.75",
        "page": 4,
        "row": 16,
        "bbox": {
          "x_min": 0.7822327044,
          "y_min": 0.3794046173,
          "x_max": 0.8313679245,
          "y_max": 0.3894289186
        },
        "confidence": 0.9786
      },
      "total_price": {
        "value": "760.75",
        "page": 4,
        "row": 16,
        "bbox": {
          "x_min": 0.8919025157,
          "y_min": 0.379708384,
          "x_max": 0.9402515723,
          "y_max": 0.3888213852
        },
        "confidence": 0.961
      }
    },
    {
      "sku_number": {
        "value": "NCM-NC28667",
        "page": 4,
        "row": 17,
        "bbox": {
          "x_min": 0.1379716981,
          "y_min": 0.4122114216,
          "x_max": 0.2503930818,
          "y_max": 0.422235723
        },
        "confidence": 0.9793,
        "spaceSeperatedFirstWord": "NCM",
        "spaceSeperatedLstWord": "NC28667"
      },
      "rehab_id": {
        "value": "",
        "page": 0,
        "row": 0
      },
      "description": {
        "value": "GOOD GRIPS BUTTON HOOK",
        "page": 4,
        "row": 17,
        "bbox": {
          "x_min": 0.2566823899,
          "y_min": 0.4122114216,
          "x_max": 0.4878144654,
          "y_max": 0.422235723
        },
        "confidence": 0.9891,
        "spaceSeperatedFirstWord": "GOOD",
        "spaceSeperatedLstWord": "HOOK"
      },
      "quantity": {
        "value": "1",
        "page": 4,
        "row": 17,
        "bbox": {
          "x_min": 0.597091195,
          "y_min": 0.412818955,
          "x_max": 0.6033805031,
          "y_max": 0.4204131227
        },
        "confidence": 0.887
      },
      "unit_price": {
        "value": "29.01",
        "page": 4,
        "row": 17,
        "bbox": {
          "x_min": 0.7916666667,
          "y_min": 0.4125151883,
          "x_max": 0.8297955975,
          "y_max": 0.4216281896
        },
        "confidence": 0.9826
      },
      "total_price": {
        "value": "29.01",
        "page": 4,
        "row": 17,
        "bbox": {
          "x_min": 0.9017295597,
          "y_min": 0.4119076549,
          "x_max": 0.9394654088,
          "y_max": 0.4219319563
        },
        "confidence": 0.9846
      }
    },
    {
      "sku_number": {
        "value": "OPTP-660",
        "page": 4,
        "row": 18,
        "bbox": {
          "x_min": 0.1383647799,
          "y_min": 0.4456257594,
          "x_max": 0.215408805,
          "y_max": 0.455346294
        },
        "confidence": 0.9883,
        "spaceSeperatedFirstWord": "OPTP",
        "spaceSeperatedLstWord": "660"
      },
      "rehab_id": {
        "value": "",
        "page": 0,
        "row": 0
      },
      "description": {
        "value": "TRANSFER GAIT BELT BY OPTP",
        "page": 4,
        "row": 18,
        "bbox": {
          "x_min": 0.1383647799,
          "y_min": 0.4456257594,
          "x_max": 0.3097484277,
          "y_max": 0.455346294
        },
        "confidence": 0.9942,
        "spaceSeperatedFirstWord": "TRANSFER",
        "spaceSeperatedLstWord": "OPTP"
      },
      "quantity": {
        "value": "1",
        "page": 4,
        "row": 18,
        "bbox": {
          "x_min": 0.5978773585,
          "y_min": 0.4459295261,
          "x_max": 0.6045597484,
          "y_max": 0.4541312272
        },
        "confidence": 0.9347
      },
      "unit_price": {
        "value": "38.00",
        "page": 4,
        "row": 18,
        "bbox": {
          "x_min": 0.7912735849,
          "y_min": 0.445018226,
          "x_max": 0.830581761,
          "y_max": 0.4550425273
        },
        "confidence": 0.9892
      },
      "total_price": {
        "value": "38.00",
        "page": 4,
        "row": 18,
        "bbox": {
          "x_min": 0.9009433962,
          "y_min": 0.4453219927,
          "x_max": 0.9406446541,
          "y_max": 0.4547387606
        },
        "confidence": 0.9899
      }
    }
  ]
}

const images = [
  {
    success: true,
    data: {
      AcceptRanges: 'bytes',
      LastModified: '2025-08-10T11:09:19.000Z',
      ContentLength: 760557,
      ETag: '"afcbb89b6794d3df322be743b17575f1"',
      ContentType: 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {},
      Body: {
        type: 'Buffer',
        data: [22, 33, 44, 55]
      }
    },
    message: 'File Get Successfully',
    error: null
  },
  {
    success: true,
    data: {
      AcceptRanges: 'bytes',
      LastModified: '2025-08-10T11:09:19.000Z',
      ContentLength: 716869,
      ETag: '"b9c51d6340009978df5770dc7abe0449"',
      ContentType: 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {},
      Body: {
        type: 'Buffer',
        data: [22, 33, 44, 55]
      }
    },
    message: 'File Get Successfully',
    error: null
  }
];
