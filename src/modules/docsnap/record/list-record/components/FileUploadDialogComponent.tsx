import { DialogComponent } from '../../../../../components/DialogComponent';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { useS3DocumentsStore } from '../../../../../zustand-store/useStoredDocuments';
import httpRequest from '../../../../../global-utils/httpRequest';
import httpUploadRequest from '../../../../../global-utils/httpUploadRequest';
import { useViewRecordGlobalStore } from '../../../../../zustand-store/useViewRecordGlobalStore';
import DragAndDropFileInput from '../../../../../components/DragAndDropFileInput';
import { useListRecordApi } from '../hooks/useListRecordApi';
import { useListRecordPageState } from '../hooks/listRecordPageContext';
import { convertJSON } from '../utils/convertJSON';
import { FileUploadAnimationComponent } from './FileUploadAnimationComponent';

interface FileUploadDialogComponentIF {
    test?: string;
}

const FileUploadDialogComponent: React.FC<FileUploadDialogComponentIF> = () => {
    const { state, setState } = useListRecordPageState();
    const { createRecordApi, updateRecordApi, uploadFilesToAwsS3, trainChatWithDocumentEngine } = useListRecordApi();
    const toast = useToastStore();
    const { updateRefresh } = useViewRecordGlobalStore();
    const { getS3File } = useS3DocumentsStore();

    const analyzeDocument = async (s3FileName: string) => {
        try {
            const convertedJson = convertJSON(state.document?.fields || []);

            const requestBody: Record<string, any> = {
                document_type: state.document?.docType || 'other',
                entity_schema: convertedJson,
                include_confidence: true,
                include_bbox: true,
                confidence_threshold: 0.5,
                s3_file_name: s3FileName,
                provider_id: 'azure',
                model_id: 'gpt-4o',
                use_latest: false
            };
            if (state.document?.enableOcr) requestBody.ocr_engine = 'doctr';
            const res = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);

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

        if (!s3Response) {
            toast.error('Failed to upload file');
            setState(prev => ({ ...prev, processing: false, uploadDone: false, uploading: false, analyzing: false }));
            return;
        }

        trainChatWithDocumentEngine(s3Response?.s3FileName, s3Response?.url);

        const res = await analyzeDocument(s3Response?.s3FileName);

        const createReqObject = {
            metadata: res,
            extractedData: null,
            pdfFileName: s3Response?.s3FileName,
            name: s3Response?.s3FileName,
            document: state.document?._id,
            documentType: s3Response?.s3FileType ? s3Response.s3FileType : 'application/pdf'
        };
        const createRecordResponse: any = await createRecordApi(createReqObject);
        getS3File(s3Response?.s3FileName || '');

        setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
        setState(prev => ({ ...prev, processing: false, fileUploadDialog: false, progress: 0, analyzeDone: false, uploadDone: false }));

        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
        const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

        eventSource.addEventListener('task_update', async (event: any) => {
            const data = JSON.parse(event.data);
            if (data.current_step === 'Complete') {
                eventSource.close();
                await updateRecordApi(
                    {
                        extractedData: data?.result?.extracted_data || {}
                    },
                    createRecordResponse.data._id
                );
                setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
                updateRefresh();
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
                    document_level_confidence: 0.6455
                }
            },
            metadata: {}
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
                    post_processing: 0
                }
            },
            task_id: 'c303ca83-286b-403f-a557-88fa5ef17df1',
            ocr_engine: 'doctr',
            include_confidence: true,
            include_bbox: true,
            confidence_threshold: 0.9
        }
    },
    ocr_info: { engine: 'doctr', include_confidence: true, include_bbox: true, confidence_threshold: 0.9 }
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
    ocr_engine: null
};
