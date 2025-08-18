import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';
import httpUploadRequest from '../global-utils/httpUploadRequest';

interface S3StorageIF {
    files: Record<string, ArrayBuffer | null>;
    uploading: Record<string, Promise<ArrayBuffer | null> | undefined>; // Allow undefined for promises
    uploadS3File: (file: File) => Promise<any>;
    getS3File: (fileName: string) => Promise<ArrayBuffer | null>;
}

export const useS3Storage = create<S3StorageIF>((set, get) => ({
    // Initial state
    files: {},
    uploading: {},

    // Action to handle file upload
    uploadS3File: async (file: File) => {
        try {
            const uploadResponse = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/idp/document/upload`, file);
            return uploadResponse.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error; // Re-throw to allow component to handle
        }
    },

    // Action to handle fetching a file
    getS3File: async (fileName: string) => {
        const { files, uploading } = get();

        // Check if the file is already in state
        if (files[fileName]) {
            return files[fileName];
        }

        // Check for an ongoing request to prevent race conditions
        if (uploading[fileName]) {
            return uploading[fileName]!;
        }

        // Create a new promise for the API call
        const fetchPromise = (async () => {
            try {
                const fileDataResponse = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/document/get/file`, {
                    fileName,
                });

                // Correctly update the files state and clear the promise
                set(state => ({
                    files: {
                        ...state.files,
                        [fileName]: fileDataResponse.data,
                    },
                    uploading: {
                        ...state.uploading,
                        [fileName]: undefined, // Clear the promise
                    },
                }));

                return fileDataResponse.data;
            } catch (error) {
                console.error(`Error fetching file: ${fileName}`, error);
                
                // Clear the promise on error as well
                set(state => ({
                    uploading: {
                        ...state.uploading,
                        [fileName]: undefined,
                    },
                }));

                return null;
            }
        })();

        // Set the promise in the state before returning it
        set(state => ({
            uploading: {
                ...state.uploading,
                [fileName]: fetchPromise,
            },
        }));

        return fetchPromise;
    },
}));