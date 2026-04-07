import { useEffect, useState } from 'react';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import { useContentCreationEditorState } from './DocumentCreationEditorContext';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useParams } from 'react-router-dom';

export const useContentCreationApi = () => {
    const { setState } = useContentCreationEditorState();
    const toast = useToastStore()
    const { id } = useParams()

    const fetchRecord = async () => {
        if (!id) return;
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
            extractedData: {
                ...(fetchedRecord?.extractedData || {}),
                title: fetchedRecord?.title || fetchedRecord?.extractedData?.title || fetchedRecord?.extractedData?.rowData?.name || fetchedRecord?.name || '',
                // author: fetchedRecord?.extractedData?.rowData?.author || '',
                primaryImageUrl: fetchedRecord?.extractedData?.primaryImageUrl || '',
                rowData: fetchedRecord?.extractedData?.rowData || {}
            },
            ...(fetchedRecord?.keywords ? { keywords: fetchedRecord.keywords } : {}),
            content: fetchedContent,
            record: fetchedRecord,
            extractionPrompt: fetchedExtractionPrompt
        }));
    };
    const regenerateBlog = async (payload: { keywords?: any[]; extractedData?: any; extractionPrompt?: string }) => {
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

    const editSelectedContent = async (requestBody: {
        selectedText: string;
        userInstruction: string;
    }): Promise<string | null> => {
        try {
            const res = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/edit-content`, requestBody);
            return res.data?.content ?? null;
        } catch {
            return null;
        }
    };

    const updateRecordApi = async (requestBody: any) => {
        try {
            const res = await httpRequest('PATCH', `${config.nodeApiUrl}/idp/history/save/extraction/${id}`, requestBody);
            toast.success('Record updated successfully');
        } catch (error) {
            toast.error('Failed to update record');
        }
    };



    return { fetchRecord, regenerateBlog, updateContentCreationPrompt, updateRecordApi, editSelectedContent };
};
