import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';
import httpUploadRequest from '../global-utils/httpUploadRequest';

interface S3DocumentsStoreIF {
    documents: Record<string, any>;
    uploadS3File: (file: File) => Promise<any>;
    getS3File: (fileName: string) => Promise<any>;
}

export const useS3DocumentsStore = create<S3DocumentsStoreIF>((set, get) => ({
    documents: {},
    uploadS3File: async (file: File) => {
        const s3Response = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/api/idp/document/upload`, file as File);

        set(() => {
            return {
                documents: {
                    ...get().documents,
                    [file.name]: s3Response
                }
            };
        });
        return s3Response.data;
    },

    getS3File: async fileName => {
        if (get().documents[fileName]) {
            return get().documents[fileName];
        } else {
            const s3Response = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/document/get/file`, {
                fileName
            });
            set(() => {
                return {
                    documents: {
                        ...get().documents,
                        [fileName]: s3Response
                    }
                };
            });
            return s3Response;
        }
    }
}));
