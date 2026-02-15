import { useEffect, useState } from 'react';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import { useContentCreationEditorState } from './DocumentCreationEditorContext';

export const useContentCreationApi = (id: string | undefined) => {
    const { setState } = useContentCreationEditorState();
    const [content, setContent] = useState('');
    const [record, setRecord] = useState<Record<string, any> | null>({});

    useEffect(() => {
        if (!id) return;
        const getRecord = async () => {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/idp/history/${id}`);
            setContent(res.data?.extractedData?.htmlContent);
            setRecord(res.data);
            setState(prev => ({
                ...prev,
                name: res.data?.name || '',
                author: res.data?.extractedData?.author || '',
                primaryImageUrl: res.data?.extractedData?.primaryImageUrl || '',
                ...(res.data?.keywords ? { keywords: res.data.keywords } : {})
            }));
        };
        getRecord();
    }, [id]);

    return { content, setContent, record };
};
