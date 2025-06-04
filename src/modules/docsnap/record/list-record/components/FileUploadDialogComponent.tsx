import { DialogComponent } from '../../../../../components/DialogComponent';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../utils/httpRequest';
import httpUploadRequest from '../../../../../utils/httpUploadRequest';
import DragAndDropFileInput from '../DragAndDropFileInput';
import { useFetchListRecord } from '../hooks/listRecordPageApi';
import { useListRecordPageState } from '../hooks/listRecordPageContext';
import { convertJSON } from '../utils/convertJSON';
import { FileUploadAnimationComponent } from './FileUploadAnimationComponent';

interface FileUploadDialogComponentIF {
  test?: string;
}

const FileUploadDialogComponent: React.FC<FileUploadDialogComponentIF> = () => {
  const { state, setState } = useListRecordPageState();
  const { createRecordApi, updateRecordApi } = useFetchListRecord();
  const toast = useToastStore();

  const clearState = () => {
    setState(prev => ({ ...prev, processing: false, fileUploadDialog: false, progress: 0, analyzeDone: false, uploadDone: false }));
  };

  const uploadFilesToAwsS3 = async (file: File) => {
    try {
      setState(prev => ({ ...prev, processing: true, uploading: true }));

      const res = await httpUploadRequest(`${import.meta.env.VITE_API_URL}/api/idp/document/upload`, file);
      setState(prev => ({ ...prev, uploading: false, uploadDone: true, analyzing: true }));

      return { s3FileName: res.data.fileName, s3FileType: res.data.fileType, url: res.data.url };
    } catch (error) {
      setState(prev => ({ ...prev, processing: false }));
    }
  };

  const trainChatWithDocumentEngine = async (s3fileName: string, s3Url: string) => {
    const response = await fetch(`${import.meta.env.VITE_BASR_URL}/chatbot/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: [
          {
            name: s3fileName,
            fileType: 'application/pdf',
            url: s3Url,
            active: true,
          },
        ],
        botName: s3fileName || 'Testbot',
      }),
    });
    const reader = response?.body?.getReader();
    if (!reader) {
      toast.error('Error in training the bot');
      return null;
    }
    while (true) {
      const { value, done } = await reader?.read();
      if (done) {
        // setloader(false);
        toast.success('Document Bot trained successfully');
        break;
      } else {
        // showToast('success', decoder.decode(value));
        toast.error('Failed to train Document Bot ');
      }
    }
  };

  const analyzeDocument = async (s3FileName: string) => {
    try {
      const convertedJson = convertJSON(state.document?.fields || []);
      const formData = new FormData();
      formData.append('s3_file_name', s3FileName);
      formData.append('document_type', state.document?.docType || 'other');
      formData.append('entity_schema', JSON.stringify(convertedJson));
      formData.append('model_type', state.document?.primaryModel || 'openai');
      if (state.document?.enableOcr) formData.append('ocr_engine', 'doctr');

      // 'document_type=purchase_order&entity_schema=%7B%7D&ocr_engine=doctr&include_confidence=false&include_bbox=false&confidence_threshold=0.5&s3_file_name=s3jjaj&provider_id=openai&model_id=aa&use_latest=false' \
      const requestBody: Record<string, any> = {
        document_type: state.document?.docType || 'other',
        entity_schema: convertedJson,
        include_confidence: true,
        include_bbox: true,
        confidence_threshold: 0.8,
        s3_file_name: s3FileName,
        provider_id: 'openai',
        model_id: 'gpt-4o',
        use_latest: false,
      };
      if (state.document?.enableOcr) requestBody.ocr_engine = 'doctr';
      const res = httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);

      setState(prev => ({ ...prev, analyzeDone: true, analyzing: false }));
      return res;
    } catch (error) {
      toast.error('Failed to add document for extraction');
      setState(prev => ({ ...prev, processing: false, uploadDone: false, uploading: false, analyzing: false }));
    } finally {
    }
  };

  const onFileDrop = async (files: FileList) => {
    if (!files[0]) return;
    const file = files[0];

    const s3Response = await uploadFilesToAwsS3(file);

    // trainChatWithDocumentEngine(s3Response?.s3FileName, s3Response?.url);

    const res = await analyzeDocument(s3Response?.s3FileName);

    const createReqObject = {
      metadata: res.data,
      extractedData: null,
      pdfFileName: s3Response?.s3FileName,
      name: s3Response?.s3FileName,
      document: state.document?._id,
      documentType: s3Response?.s3FileType ? s3Response.s3FileType : 'application/pdf',
    };
    const createRecordResponse: any = await createRecordApi(createReqObject);
    setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));

    setTimeout(() => {
      setState(prev => ({ ...prev, processing: false, fileUploadDialog: false, progress: 0, analyzeDone: false, uploadDone: false }));
    }, 2000);

    const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
    const eventSource = new EventSource(`${import.meta.env.VITE_BASR_URL}/ai/${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

    eventSource.addEventListener('task_update', async (event: any) => {
      const data = JSON.parse(event.data);
      console.info('data:===========', data);
      if (data.current_step === 'Complete') {
        await updateRecordApi(
          {
            extractedData: data?.result?.extracted_data || {},
            metaData: data?.result?.metadata,
            apiResponse: data?.result?.extracted_data || {},
          },
          createRecordResponse.data._id
        );
        setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
        eventSource.close();
      }
    });
    eventSource.onerror = (error: any) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };
  };

  return (
    <DialogComponent name="Select File" isOpen={state.fileUploadDialog} closeDialog={() => setState(prev => ({ ...prev, fileUploadDialog: false }))}>
      <div className="flex h-[calc(100vh-200px)] w-[80vw] items-center justify-center px-20 py-5">
        {state.processing ? (
          <FileUploadAnimationComponent
            processing={state.processing}
            analyzing={state.analyzing}
            uploading={state.uploading}
            analyzeDone={state.analyzeDone}
            uploadDone={state.uploadDone}
          />
        ) : (
          <DragAndDropFileInput onFileDrop={onFileDrop} />
        )}
      </div>
    </DialogComponent>
  );
};

export default FileUploadDialogComponent;

const aaaa = {
  task_id: 'c303ca83-286b-403f-a557-88fa5ef17df1',
  status: 'SUCCESS',
  result: {
    status: 'SUCCESS',
    extracted_data: {
      vision_llm_response: {
        purchase_order: { po_number: null, po_contact_person: null },
        metadata: {
          document_type: 'purchase_order',
          model_used: 'azure:gpt-4o',
          processing_timestamp: '2025-06-02T05:12:57.020807',
          document_level_confidence: 0.6455,
        },
      },
      metadata: {},
    },
    metadata: {
      document_type: 'purchase_order',
      model_used: 'azure:gpt-4o',
      pages_processed: 4,
      successful_pages: 4,
      filename: '544-u41393.pdf',
      processing_timestamp: '2025-06-02T05:12:57.034519',
      processing_times: {
        total_time: 35.63,
        stages: {
          pre_processing: 0,
          schema_validation: 0,
          schema_processing: 0,
          llm_processing: 5.09,
          ocr_processing: 35.61,
          merge_processing: 0.01,
          post_processing: 0,
        },
      },
      task_id: 'c303ca83-286b-403f-a557-88fa5ef17df1',
      ocr_engine: 'doctr',
      include_confidence: true,
      include_bbox: true,
      confidence_threshold: 0.9,
    },
  },
  ocr_info: { engine: 'doctr', include_confidence: true, include_bbox: true, confidence_threshold: 0.9 },
};

const sampleResponse = {
  task_id: '76f56ff0-4c8c-41c7-8562-13c0c845fd11',
  request_id: '16f49985-851f-43c7-85f5-16df60f734a6',
  status: 'Processing',
  status_url: '/api/v5/document/tasks/76f56ff0-4c8c-41c7-8562-13c0c845fd11/status',
  stream_url: '/api/v5/document/tasks/76f56ff0-4c8c-41c7-8562-13c0c845fd11/stream',
  provider: 'Azure OpenAI',
  model: 'GPT-4o',
  ocr_enabled: false,
  ocr_engine: null,
};
