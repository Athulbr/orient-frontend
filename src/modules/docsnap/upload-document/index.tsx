import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import DragAndDropFileInput from '../../../components/DragAndDropFileInput';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';
import { useNavigate } from 'react-router-dom';
import httpRequest from '../../../global-utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';
interface UploadDocumentComponentIF {
    template?: any;
    closeDialog: () => void;
}

export const UploadDocumentComponent: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template }) => {
    const { addToExtraction, addToNodeExtraction } = useDocsnapStore();
    const navigate = useNavigate();
    const toast = useToastStore();
    const [templateData, setTemplateData] = useState<any>(null);
    const { userSettings } = useSettingsStore();
    useEffect(() => {
        const getTemplate = async () => {
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/template/${template._id}`);
            setTemplateData(res.data);
        };
        if (template?._id) {
            getTemplate();
        }
    }, [template?._id]);
    const onFileDrop = (files: FileList) => {
        if (files.length > 20) {
            toast.error('You can select up to 20 files only.');
            return;
        }
        const extractionEngine = userSettings?.extractionEngine;
        if (extractionEngine === 'node') {
            if (!templateData) {
                alert('Template not found');
                return;
            }
            addToNodeExtraction(files, templateData || '', (path: string) => navigate(path));
        } else {
            addToExtraction(files, templateData || '');
        }

        navigate('/docsnap/record/list');
        closeDialog();
    };
    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
            name="Upload Documents"
            isOpen={true}
            closeDialog={closeDialog}
        >
            <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10">
                <DragAndDropFileInput onFileDrop={onFileDrop} />
            </div>
        </DialogComponent>
    );
};
