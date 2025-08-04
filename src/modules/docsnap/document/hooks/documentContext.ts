import { createContext, useContext } from 'react';
import { DocumentStateIF } from '..';

const documentStateContext = createContext<DocumentContextIF | undefined>(undefined);
export const DocumentStateProvider = documentStateContext.Provider;

export const useDocumentState = () => {
    const context = useContext(documentStateContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface DocumentContextIF {
    state: DocumentStateIF;
    setState: React.Dispatch<React.SetStateAction<DocumentStateIF>>;
}
