import { useEffect, useState } from 'react';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import { useContentCreationEditorState } from './DocumentCreationEditorContext';

export const useContentCreationApi = (id: string | undefined) => {
    const { setState } = useContentCreationEditorState();

    useEffect(() => {
        if (!id) return;
        const getRecord = async () => {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/idp/history/${id}`);
            const fetchedRecord = res.data;
            const fetchedContent = fetchedRecord?.extractedData?.htmlContent || '';

            let fetchedExtractionPrompt = '';
            if (fetchedRecord?.templateId) {
                const templateId = fetchedRecord.templateId._id;
                const templateRes = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${templateId}`);
                fetchedExtractionPrompt = templateRes.data?.settings?.extractionPrompt || '';
            }

            setState(prev => ({
                ...prev,
                name: fetchedRecord?.name || '',
                author: fetchedRecord?.extractedData?.author || '',
                rowData: fetchedRecord?.extractedData?.rowData || {},
                primaryImageUrl: fetchedRecord?.extractedData?.primaryImageUrl || '',
                ...(fetchedRecord?.keywords ? { keywords: fetchedRecord.keywords } : {}),
                content: fetchedContent,
                record: fetchedRecord,
                extractionPrompt: fetchedExtractionPrompt
            }));
        };
        getRecord();
    }, [id]);

    const regenerateBlog = async (payload: { keywords?: any[]; rowData?: any; extractionPrompt?: string }) => {
        const res = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/regenerate-blog`, payload);
        return res;
    };

    const updateContentCreationPrompt = async (requestBody: {
        userInstruction: string;
        currentPrompt?: string;
    }): Promise<string | null> => {
        try {
            const res = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/update-prompt`, requestBody);
            return res.data?.prompt;
        } catch (error: any) {
            return null;
        }
    };

    return { regenerateBlog, updateContentCreationPrompt };
};
