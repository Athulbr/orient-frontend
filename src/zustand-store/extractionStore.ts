import { create } from 'zustand';

interface ExtractionItem {
    fileName: string;
    status: 'completed' | 'failed' | 'processing';
    time: number;
    abortController?: AbortController;
    step?: string;
    progress?: number;
}

interface ExtractionStoreIF {
    refreshRecord: number;
    updateRefreshRecord: () => void;

    extractionQueue: ExtractionItem[];
    addToExtractionQueue: (fileName: string) => void;
    updateExtractionQueue: (fileName: string, changes: Partial<ExtractionItem>) => void;
    clearExtractionQueue: () => void;
    refreshExtractionQueue: (fileName: string) => void;
    handleCompletion: (timer: any, processingFiles: any[], fileName: string) => void;
    handleError: (timer: any, processingFiles: any[], fileName: string) => void;
    startTimer: (fileName: string) => NodeJS.Timeout;
}

export const useExtractionStore = create<ExtractionStoreIF>((set, get) => {
    return {
        refreshRecord: 0,
        extractionQueue: [],

        updateRefreshRecord: () => set({ refreshRecord: get().refreshRecord + 1 }),

        startTimer: (fileName: string): NodeJS.Timeout => {
            return setInterval(() => {
                const currentItem = get().extractionQueue.find(i => i.fileName === fileName);
                if (currentItem) {
                    get().updateExtractionQueue(fileName, {
                        time: currentItem.time + 1
                    });
                }
            }, 1000);
        },

        addToExtractionQueue: (fileName: string) => {
            set({
                extractionQueue: [
                    ...get().extractionQueue,
                    {
                        fileName,
                        status: 'processing',
                        time: 0
                    }
                ]
            });
        },

        refreshExtractionQueue: (fileName: string) => {
            set({
                extractionQueue: get().extractionQueue.filter(i => i.fileName !== fileName)
            });
        },

        clearExtractionQueue: () => set({ extractionQueue: [] }),

        updateExtractionQueue: (fileName: string, changes: Partial<ExtractionItem>) => {
            set({
                extractionQueue: get().extractionQueue.map(item => (item.fileName === fileName ? { ...item, ...changes } : item))
            });
        },

        handleCompletion: (timer: any, processingFiles: any[], fileName: string) => {
            clearInterval(timer);
            if (processingFiles.length < 2) {
                set({ refreshRecord: get().refreshRecord + 1 });
            }
            get().updateExtractionQueue(fileName, { status: 'completed' });
        },

        handleError: (timer: any, processingFiles: any[], fileName: string) => {
            clearInterval(timer);
            if (processingFiles.length < 2) {
                set({ refreshRecord: get().refreshRecord + 1 });
            }
            get().updateExtractionQueue(fileName, { status: 'failed' });
            console.error(`File ${fileName} processing failed`);
        }
    };
});
