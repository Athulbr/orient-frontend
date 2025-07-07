import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';

interface S3DocumentsStoreIF {
  documents: Record<string, any>;
  getS3File: (fileName: string) => Promise<any>;
}

export const useS3DocumentsStore = create<S3DocumentsStoreIF>((set, get) => ({
  documents: {},

  getS3File: async fileName => {
    if (get().documents[fileName]) {
      return get().documents[fileName];
    } else {
      const s3Response = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/document/get/file`, {
        fileName,
      });
      set(() => {
        return {
          documents: {
            ...get().documents,
            [fileName]: s3Response,
          },
        };
      });
      return s3Response;
    }
  },
}));
