import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';
import httpUploadRequest from '../global-utils/httpUploadRequest';

interface S3DocumentsStoreIF {
    documents: Record<string, any>;
    uploadS3File: (file: File) => Promise<any>;
    getS3File: (fileName: string) => Promise<any>;
    clearCache: () => void;
    clearOldCache: (maxAge?: number) => void;
    manageCacheLimit: () => void;
}

// Helper functions for localStorage management
const getFromLocalStorage = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const data = JSON.parse(item);
        // Check if it's a cached image with timestamp
        if (data.timestamp && data.data) {
            return data;
        }
        // Legacy support for items without timestamp
        return { data: data, timestamp: Date.now() };
    } catch (error) {
        console.warn('Failed to parse localStorage item:', error);
        return null;
    }
};

const setToLocalStorage = (key: string, value: any) => {
    try {
        const cacheItem = {
            data: value,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
        // Also store timestamp separately for easy cleanup
        localStorage.setItem(`${key}`, Date.now().toString());
    } catch (error) {
        console.warn('Failed to store in localStorage (possibly quota exceeded):', error);
    }
};

const removeFromLocalStorage = (key: string) => {
    try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}`);
    } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
    }
};

const convertBufferToDataURL = (s3Response: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!s3Response.Body?.data) {
            reject(new Error('No buffer data found'));
            return;
        }

        const bufferData = new Uint8Array(s3Response.Body.data);
        const blob = new Blob([bufferData], {
            type: s3Response.ContentType || 'application/octet-stream'
        });

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert buffer to data URL'));
        reader.readAsDataURL(blob);
    });
};

export const useS3DocumentsStore = create<S3DocumentsStoreIF>((set, get) => ({
    documents: {},

    uploadS3File: async (file: File) => {
        const s3Response = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/api/idp/document/upload`, file as File);

        // Store in Zustand state
        set(() => ({
            documents: {
                ...get().documents,
                [file.name]: s3Response
            }
        }));

        // If response contains buffer data, convert and cache
        if (s3Response.Body?.data) {
            try {
                const dataURL = await convertBufferToDataURL(s3Response);
                const cacheResponse = { ...s3Response, dataURL };
                setToLocalStorage(`s3_document_${file.name}`, cacheResponse);

                // Check and manage cache limit after adding new item
                get().manageCacheLimit();

                // Update state with dataURL
                set(() => ({
                    documents: {
                        ...get().documents,
                        [file.name]: cacheResponse
                    }
                }));
            } catch (error) {
                console.warn('Failed to process uploaded file for caching:', error);
            }
        }

        return s3Response.data;
    },

    getS3File: async (fileName: string) => {
        // Check Zustand state first
        if (get().documents[fileName]) {
            return get().documents[fileName];
        }

        // Check localStorage cache
        const cached = getFromLocalStorage(`s3_document_${fileName}`);
        if (cached) {
            // Update Zustand state with cached data
            set(() => ({
                documents: {
                    ...get().documents,
                    [fileName]: cached.data
                }
            }));
            return cached.data;
        }

        // Fetch from server if not cached
        try {
            const s3Response = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/document/get/file`, { fileName });

            // Convert buffer to data URL if present
            let processedResponse = s3Response;
            if (s3Response.Body?.data) {
                try {
                    const dataURL = await convertBufferToDataURL(s3Response);
                    processedResponse = { ...s3Response, dataURL };
                } catch (error) {
                    console.warn('Failed to convert buffer to data URL:', error);
                }
            }

            // Store in both Zustand state and localStorage
            set(() => ({
                documents: {
                    ...get().documents,
                    [fileName]: processedResponse
                }
            }));

            setToLocalStorage(`s3_document_${fileName}`, processedResponse);

            // Check and manage cache limit after adding new item
            get().manageCacheLimit();

            return processedResponse;
        } catch (error) {
            console.error('Failed to fetch S3 file:', error);
            throw error;
        }
    },

    clearCache: () => {
        // Clear Zustand state
        set(() => ({ documents: {} }));

        // Clear localStorage cache
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('s3_document_')) {
                removeFromLocalStorage(key.replace('', ''));
            }
        });
    },

    clearOldCache: (maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
        // 7 days default
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('s3_document_') && key.endsWith('')) {
                const timestamp = localStorage.getItem(key);
                if (timestamp && Date.now() - parseInt(timestamp) > maxAge) {
                    const documentKey = key.replace('', '');
                    removeFromLocalStorage(documentKey);

                    // Also remove from Zustand state if present
                    const fileName = documentKey.replace('s3_document_', '');
                    const currentDocuments = get().documents;
                    if (currentDocuments[fileName]) {
                        const { [fileName]: removed, ...remainingDocuments } = currentDocuments;
                        set(() => ({ documents: remainingDocuments }));
                    }
                }
            }
        });
    },

    manageCacheLimit: () => {
        // Get all cached s3 documents with timestamps
        const cachedItems = Object.keys(localStorage)
            .filter(key => key.startsWith('s3_document_') && key.endsWith(''))
            .map(key => ({
                key: key.replace('', ''),
                timestamp: parseInt(localStorage.getItem(key) || '0'),
                fileName: key.replace('s3_document_', '').replace('', '')
            }))
            .sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first

        // If we have 25 or more items, remove the oldest 10
        if (cachedItems.length >= 25) {
            const itemsToRemove = cachedItems.slice(0, 10); // Get oldest 10 items

            itemsToRemove.forEach(item => {
                removeFromLocalStorage(item.key);

                // Also remove from Zustand state if present
                const currentDocuments = get().documents;
                if (currentDocuments[item.fileName]) {
                    const { [item.fileName]: removed, ...remainingDocuments } = currentDocuments;
                    set(() => ({ documents: remainingDocuments }));
                }
            });

            console.log(`Cache limit reached. Removed ${itemsToRemove.length} oldest files.`);
        }
    }
}));
