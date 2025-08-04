import { useNavigate, useParams } from "react-router-dom";
import { useViewRecordState } from "./viewRecordContext";
import { useToastStore } from "../../../../../components/toast/ToastStore";
import httpRequest from "../../../../../global-utils/httpRequest";
import { fileTypeFromBuffer } from "file-type";
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from "../utils";
import { useS3DocumentsStore } from "../../../../../zustand-store/useStoredDocuments";

export const useViewRecordApi = () => {
  const { state, setState } = useViewRecordState();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { getS3File } = useS3DocumentsStore();

  // ============================= Get Record By Id ==================================

  const getAndConvertDocumentToImage = async (pdfFileName: string) => {
    setState((prev) => ({ ...prev, loadingS3File: true }));
    const s3Response = await getS3File(pdfFileName);
    const imageData = s3Response?.data?.Body?.data;
    if (!imageData) {
      toast.error("S3 document not found");
      return;
    }
    const uint8Array = new Uint8Array(imageData);
    const getFileType = await fileTypeFromBuffer(uint8Array);
    let pdfFile: any;
    let imageUrlArray;
    if (getFileType?.mime && getFileType?.mime !== "application/pdf") {
      pdfFile = await binaryToFile(uint8Array, `image.${getFileType.ext}`, getFileType?.mime);
      imageUrlArray = [URL.createObjectURL(pdfFile).toString()];
    } else {
      pdfFile = await binaryToFile(uint8Array, `document.${getFileType?.ext}`, getFileType?.mime);
      imageUrlArray = await convertPdfToImages(pdfFile);
    }

    setState((prev) => ({
      ...prev,
      loadingS3File: false,
      images: imageUrlArray,
    }));
  };

  const getRecordApiById = async (id: string) => {
    try {
      setState((prev) => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest("GET", `${import.meta.env.VITE_NODE_URL}/api/idp/history/${id}`);
      if (res.data.imageFileNames) {
        setState((prev) => ({
          ...prev,
          loadingS3File: false,
          images: res.data.imageFileNames,
        }));
      } else {
        getAndConvertDocumentToImage(res.data.pdfFileName);
      }
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
          } else if (typeof value === "object" && value !== null && value?.value === undefined) {
            // its object
            objectFields[key] = value;
          }
        });
      }
      setState((prev) => ({
        ...prev,
        record: res.data,
        objectFields,
        arrayFields,
        tableNames,
        loadingData: false,
      }));
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to get Record");
    } finally {
      setState((prev) => ({ ...prev, loadingData: false }));
    }
  };

  const sendMessage = async (message: string) => {
    setState((prev) => ({
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

    const response: any = await httpRequest("POST", `https://demo.makez.ai/chatbot/query`, requestBody);

    setState((prev) => ({
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
        extractedData: {
          ...state?.objectFields,
          line_items: state?.arrayFields[0],
        },
        name: state?.record?.name,
      };
      setState((prev) => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest("POST", `${import.meta.env.VITE_NODE_URL}/api/idp/history/rehab/create`, payload);
      toast.success("Record submitted successfully");
      navigate("/docsnap/record/list");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to update Record");
      navigate("/docsnap/record/list");
    } finally {
      setState((prev) => ({ ...prev, loadingData: false }));
    }
  };

  const updateRecordApiById = async () => {
    try {
      const payload = {
        template: state?.record?.templateId,
        extractedData: state?.record?.extractedData,
        metadata: state?.record?.metadata,
        fileName: state?.record?.name,
        updatedData: {
          ...state?.objectFields,
          line_items: state?.arrayFields[0],
        },
      };

      setState((prev) => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest("PATCH", `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, payload);
      toast.success("Record updated successfully");
      navigate("/");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to update Record");
    } finally {
      setState((prev) => ({ ...prev, loadingData: false }));
    }
  };
  const updateExtractedData = async (extractedData: any) => {
    try {
      setState((prev) => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest("PATCH", `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, { extractedData });
      toast.success("Record updated successfully");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to update Record");
    } finally {
      setState((prev) => ({ ...prev, loadingData: false }));
    }
  };
  const generateInvoiceWithAI = async () => {
    try {
      const filteredData = filterExtractedDataForInvoiceGeneration(state.record?.extractedData);
      setState((prev) => ({ ...prev, generatingInvoice: true }));
      // test
      const res: any = await httpRequest("POST", `${import.meta.env.VITE_NODE_URL}/api/idp/history/generate-invoice`, {
        purchaseOrder: filteredData,
      });
      setState((prev) => ({
        ...prev,
        invoiceContent: res.invoice || "Error generating invoice",
      }));
      toast.success("Invoice generated successfully");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to generate Invoice");
    } finally {
      setState((prev) => ({ ...prev, generatingInvoice: false }));
    }
  };
  const createRequestedNewField = async (description: string) => {
    try {
      const requestBody = {
        description,
        requestType: "field",
        document: state.record?.templateId._id, // TODO: update this
      };
      setState((prev) => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest("POST", `${import.meta.env.VITE_NODE_URL}/api/idp/request/create`, requestBody);
      toast.success("Request created successfully");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to create Request");
    } finally {
      setState((prev) => ({
        ...prev,
        creatingRequest: false,
        requestNewFieldDialog: false,
      }));
    }
  };
  const createComment = async (comment: string, jsonKey: string) => {
    try {
      const requestBody = {
        jsonKey,
        comment,
        templateId: state.record?.templateId._id,
      };
      setState((prev) => ({ ...prev, creatingRequest: true }));
      const res: any = await httpRequest("POST", `${import.meta.env.VITE_NODE_URL}/api/idp/comment/create`, requestBody);

      toast.success("Comment created successfully");
    } catch (error) {
      console.error("error:===========", error);
      toast.error("Failed to create Comment");
    } finally {
      setState((prev) => ({ ...prev, creatingRequest: false }));
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

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = "application/pdf"): Promise<File> => {
  const blob = new Blob([binaryData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

const sampleExtractedData = {
  basic_details: {
    purchase_agent: {
      value: "Nathan Baumert",
      confidence: 0.9875,
      bbox: {
        x_min: "0.154248366",
        y_min: "0.7156565657",
        x_max: "0.2091503268",
        y_max: "0.7242424242",
      },
      page: 1,
      similarity: 1,
    },
    contact_email: {
      value: "nathan.baumert@va.gov",
      confidence: 0.9821,
      bbox: {
        x_min: "0.5215686275",
        y_min: "0.2964646465",
        x_max: "0.7183006536",
        y_max: "0.3106060606",
      },
      page: 1,
      similarity: 1,
    },
    po_number: {
      value: "636-R4K813",
      confidence: 0.9777,
      bbox: {
        x_min: "0.5934640523",
        y_min: "0.0813131313",
        x_max: "0.6588235294",
        y_max: "0.0914141414",
      },
      page: 2,
      similarity: 1,
    },
    from_location: {
      value: "IOWA CITY (636A8/121)",
      confidence: 0.9924,
      bbox: {
        x_min: "0.5562091503",
        y_min: "0.1590909091",
        x_max: "0.5869281046",
        y_max: "0.1712121212",
      },
      page: 3,
      similarity: 1,
    },
    contract_number: {
      value: null,
      confidence: 0,
      bbox: null,
      page: 1,
      similarity: 0,
    },
    quote_id: {
      value: "",
      confidence: 0,
      bbox: null,
      page: 1,
      similarity: 0,
    },
    subtotal: {
      value: 2550,
      confidence: 0.9566,
      bbox: {
        x_min: "0.8307189542",
        y_min: "0.3676767677",
        x_max: "0.8869281046",
        y_max: "0.3767676768",
      },
      page: 3,
      similarity: 1,
    },
    tax: {
      value: "",
      confidence: 0,
      bbox: null,
      page: 1,
      similarity: 0,
    },
    total_amount: {
      value: 2550,
      confidence: 0.9671,
      bbox: {
        x_min: "0.722875817",
        y_min: "0.6525252525",
        x_max: "0.7568627451",
        y_max: "0.6626262626",
      },
      page: 2,
      similarity: 1,
    },
    shipping_cost: {
      value: 0,
      confidence: 0.9566,
      bbox: null,
      page: 2,
      similarity: 1,
    },
    discount: {
      value: 0,
      confidence: 0.9614,
      bbox: null,
      page: 2,
      similarity: 1,
    },
  },
  bill_to: {
    bill_to_name: {
      value: "Nathan Baumert",
      confidence: 0.9875,
      bbox: {
        x_min: "0.154248366",
        y_min: "0.7156565657",
        x_max: "0.2091503268",
        y_max: "0.7242424242",
      },
      page: 1,
      similarity: 1,
    },
    street: {
      value: "601 Highway 6 West",
      confidence: 0.9924,
      bbox: {
        x_min: "0.5444444444",
        y_min: "0.1762626263",
        x_max: "0.6006535948",
        y_max: "0.1863636364",
      },
      page: 3,
      similarity: 1,
    },
    city: {
      value: "Iowa City",
      confidence: 0.9924,
      bbox: {
        x_min: "0.5562091503",
        y_min: "0.1590909091",
        x_max: "0.5869281046",
        y_max: "0.1712121212",
      },
      page: 3,
      similarity: 1,
    },
    state: {
      value: "IA",
      confidence: 0.9906,
      bbox: {
        x_min: "0.5836601307",
        y_min: "0.1883838384",
        x_max: "0.5993464052",
        y_max: "0.1984848485",
      },
      page: 3,
      similarity: 1,
    },
    zip: {
      value: "52246",
      confidence: 0.9877,
      bbox: {
        x_min: "0.6078431373",
        y_min: "0.1883838384",
        x_max: "0.6509803922",
        y_max: "0.1984848485",
      },
      page: 3,
      similarity: 1,
    },
    phone_number: {
      value: "319-338-0581",
      confidence: 0.9821,
      bbox: {
        x_min: "0.5130718954",
        y_min: "0.201010101",
        x_max: "0.6111111111",
        y_max: "0.2095959596",
      },
      page: 3,
      similarity: 1,
    },
    bill_to_company: {
      value: "IOWA CITY VAMC",
      confidence: 0.9924,
      bbox: {
        x_min: "0.5562091503",
        y_min: "0.1590909091",
        x_max: "0.5869281046",
        y_max: "0.1712121212",
      },
      page: 3,
      similarity: 1,
    },
  },
  ship_to: {
    ship_to_company: {
      value: "",
      confidence: 0,
      bbox: null,
      page: 1,
      similarity: 0,
    },
    name: {
      value: "Roger Rydstrom",
      confidence: 0.9912,
      bbox: {
        x_min: "0.145751634",
        y_min: "0.5151515152",
        x_max: "0.2071895425",
        y_max: "0.5287878788",
      },
      page: 4,
      similarity: 1,
    },
    street: {
      value: "3 Russell Slade Blvd #431",
      confidence: 0.9925,
      bbox: {
        x_min: "0.0908496732",
        y_min: "0.3954545455",
        x_max: "0.1745098039",
        y_max: "0.4060606061",
      },
      page: 4,
      similarity: 1,
    },
    city: {
      value: "Coralville",
      confidence: 0.9925,
      bbox: {
        x_min: "0.0908496732",
        y_min: "0.3954545455",
        x_max: "0.1745098039",
        y_max: "0.4060606061",
      },
      page: 4,
      similarity: 1,
    },
    state: {
      value: "IA",
      confidence: 0.9906,
      bbox: {
        x_min: "0.5836601307",
        y_min: "0.1883838384",
        x_max: "0.5993464052",
        y_max: "0.1984848485",
      },
      page: 4,
      similarity: 1,
    },
    zip: {
      value: "52241",
      confidence: 0.991,
      bbox: {
        x_min: "0.2359477124",
        y_min: "0.3954545455",
        x_max: "0.2797385621",
        y_max: "0.4060606061",
      },
      page: 4,
      similarity: 1,
    },
    phone_number: {
      value: "239-216-3677",
      confidence: 0.9846,
      bbox: {
        x_min: "0.1222222222",
        y_min: "0.4070707071",
        x_max: "0.1869281046",
        y_max: "0.4186868687",
      },
      page: 4,
      similarity: 1,
    },
  },
  card_info: {
    name: {
      value: "Nathan Baumert",
      confidence: 0.9875,
      bbox: {
        x_min: "0.154248366",
        y_min: "0.7156565657",
        x_max: "0.2091503268",
        y_max: "0.7242424242",
      },
      page: 1,
      similarity: 1,
    },
    card_number: {
      value: "4716401000489473",
      confidence: 0.9896,
      bbox: {
        x_min: "0.0810457516",
        y_min: "0.7888888889",
        x_max: "0.2176470588",
        y_max: "0.7974747475",
      },
      page: 2,
      similarity: 1,
    },
    expiration_date: {
      value: "07/26",
      confidence: 0.9197,
      bbox: {
        x_min: "0.2320261438",
        y_min: "0.4707070707",
        x_max: "0.2836601307",
        y_max: "0.4818181818",
      },
      page: 1,
      similarity: 1,
    },
    cvv: {
      value: "825",
      confidence: 0.9716,
      bbox: {
        x_min: "0.1555555556",
        y_min: "0.4888888889",
        x_max: "0.1869281046",
        y_max: "0.497979798",
      },
      page: 1,
      similarity: 1,
    },
  },
  line_items: [
    {
      sku_number: {
        value: "JHI-MPCA210400",
        confidence: 0.9931,
        bbox: {
          x_min: "0.2019607843",
          y_min: "0.1777777778",
          x_max: "0.2359477124",
          y_max: "0.1853535354",
        },
        page: 3,
        similarity: 1,
      },
      rehab_id: {
        value: "",
        confidence: 0,
        bbox: null,
        page: 3,
        similarity: 0,
      },
      description: {
        value: "PATIENT FLOOR LIFT - MANGAR EAGLE LIF",
        confidence: 0.9945,
        bbox: {
          x_min: "0.3366013072",
          y_min: "0.3676767677",
          x_max: "0.3973856209",
          y_max: "0.3767676768",
        },
        page: 3,
        similarity: 1,
      },
      quantity: {
        value: 1,
        confidence: 0.9915,
        bbox: {
          x_min: "0.5444444444",
          y_min: "0.3282828283",
          x_max: "0.6169934641",
          y_max: "0.3388888889",
        },
        page: 3,
        similarity: 1,
      },
      unit_price: {
        value: 2550,
        confidence: 0.9566,
        bbox: {
          x_min: "0.8307189542",
          y_min: "0.3676767677",
          x_max: "0.8869281046",
          y_max: "0.3767676768",
        },
        page: 3,
        similarity: 1,
      },
      total_price: {
        value: 2550,
        confidence: 0.9566,
        bbox: {
          x_min: "0.8307189542",
          y_min: "0.3676767677",
          x_max: "0.8869281046",
          y_max: "0.3767676768",
        },
        page: 3,
        similarity: 1,
      },
    },
  ],
};
