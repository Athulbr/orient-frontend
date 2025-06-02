import { DialogComponent } from '../../../../../components/DialogComponent';
import { useToastStore } from '../../../../../components/toast/ToastStore';
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

      return { s3FileName: res.data.fileName, s3FileType: res.data.fileType };
    } catch (error) {
      setState(prev => ({ ...prev, processing: false }));
    }
  };

  const analyzeDocument = async (s3FileName: string) => {
    try {
      const convertedJson = convertJSON(state.document?.fields || []);
      const accessToken = window?.sessionStorage?.getItem('accessToken') || '';
      const formData = new FormData();
      formData.append('s3_file_name', s3FileName);
      formData.append('document_type', state.document?.docType || 'other');
      formData.append('entity_schema', JSON.stringify(convertedJson));
      formData.append('model_type', state.document?.primaryModel || 'openai');
      if (state.document?.enableOcr) formData.append('ocr_engine', 'doctr');

      const response = await fetch(`${import.meta.env.VITE_PYTHON_API_URL}`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken ? JSON.parse(accessToken) : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({ ...prev, analyzeDone: true, analyzing: false }));
      return data;
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

    const res = await analyzeDocument(s3Response?.s3FileName);

    console.log('analyze:===========', res);

    const createReqObject = {
      metadata: res.data,
      extractedData: null,
      pdfFileName: s3Response?.s3FileName,
      name: s3Response?.s3FileName,
      document: state.document?._id,
      documentType: s3Response?.s3FileType ? s3Response.s3FileType : 'application/pdf',
    };
    const createRecordResponse: any = await createRecordApi(createReqObject);
    setTimeout(() => {
      setState(prev => ({ ...prev, processing: false, fileUploadDialog: false, progress: 0, analyzeDone: false, uploadDone: false }));
    }, 2000);

    const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
    const eventSource = new EventSource(`${import.meta.env.VITE_BASR_URL}/ai/${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

    eventSource.addEventListener('message', (event: any) => {
      const data = JSON.parse(event.data);
      console.log('data:===========', data);
      if (data.status === 'SUCCESS') {
        console.log('createRecordResponse:===========', createRecordResponse);
        updateRecordApi(
          { extractedData: data.result?.result?.vision_llm_response?.purchase_order || {}, metaData: data?.result?.result?.metadata || {} },
          createRecordResponse.data._id
        );
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
