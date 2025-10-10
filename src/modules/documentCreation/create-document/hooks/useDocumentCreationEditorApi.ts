import { template } from 'lodash';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';
import { useDocumentCreationEditorState } from './DocumentCreationEditorContext';
import nunjucks from 'nunjucks';

export const useDocumentCreationEditorApi = () => {
    const { state, setState } = useDocumentCreationEditorState();
    const toast = useToastStore();

    const getTemplateByIdApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loadingTemplate: true }));
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/template/${id}`);

            const values: any = {};
            res.data?.fields?.forEach((field: any) => {
                field?.subFields?.forEach((subField: any) => {
                    values[subField.jsonKey] = '_______________';
                });
            });
            const finalDocumentText = nunjucks.renderString(res.data?.description, values);
            setState(prev => ({
                ...prev,
                template: res.data,
                loadingTemplate: false,
                formFields: res.data?.fields,
                documentText: finalDocumentText
            }));
            return res.data;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch template');
        }
    };

    return { getTemplateByIdApi };
};
