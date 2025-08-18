import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';
import httpUploadRequest from '../global-utils/httpUploadRequest';

interface S3StorageIF {
    files: Record<string, any>;
    uploadS3File: (file: File) => Promise<any>;
    getS3File: (fileName: string) => Promise<any>;
}

export const useS3Storage = create<S3StorageIF>((set, get) => ({
    files: {},
    uploadS3File: async (file: File) => {
        const s3Response = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/idp/document/upload`, file as File);
        set(files => ({...files,[file.name]: s3Response}));
        return s3Response.data;
    },

    getS3File: async fileName => {
        if (get().files[fileName])return get().files[fileName];
        const s3Response = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/document/get/file`, {
            fileName
        });
        set(files => ({...files,[fileName]: s3Response.data}));
        return s3Response.data;
    }
}));
