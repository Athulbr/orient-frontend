import { create } from 'zustand';
import httpUploadRequest from '../utils/httpUploadRequest';
import httpRequest from '../utils/httpRequest';
import { convertJSON } from '../modules/docsnap/record/list-record/utils/convertJSON';

interface DocsnapStoreIF {
  extractionQueue: any[];
  clearExtractionQueue: () => void;
  addToExtraction: (files: FileList, template: any) => Promise<any>;
}

export const useDocsnapStore = create<DocsnapStoreIF>((set, get) => ({
  extractionQueue: [],
  clearExtractionQueue: () => set({ extractionQueue: [] }),
  addToExtraction: async (files: FileList, template: any) => {
    Array.from(files).forEach(async file => {
      try {
        set({ extractionQueue: [...get().extractionQueue, { fileName: file.name, status: 'Uploading' }] });
        const s3Response = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/api/idp/document/upload`, file as File);
        set({ extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item)) });
        const convertedJson = convertJSON(template?.fields || []);
        const requestBody: Record<string, any> = {
          document_type: template.docType || 'other',
          entity_schema: convertedJson,
          include_confidence: true,
          include_bbox: true,
          confidence_threshold: 0.8,
          s3_file_name: s3Response?.data?.fileName,
          provider_id: 'azure',
          model_id: 'gpt-4o',
          use_latest: false,
        };
        if (template.enableOcr) requestBody.ocr_engine = 'doctr';
        const res = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);
        set({ extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item)) });

        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
        const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai/${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

        eventSource.addEventListener('task_update', async (event: any) => {
          const data = JSON.parse(event.data);
          set({ extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: data.status } : item)) });
          if (data.current_step === 'Complete') {
            eventSource.close();
          }
        });
      } catch (error) {
        set({ extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'failed' } : item)) });
      }
    });
  },
}));
