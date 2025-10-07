import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import DragAndDropFileInput from '../../../components/DragAndDropFileInput';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';
import { useNavigate } from 'react-router-dom';
import httpRequest from '../../../global-utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';
import { useNodeJsDocumentExtractor } from './useNodeJsDocumentExtractor';
import { usePythonSingleDocumentExtractor } from './usePythonSingleDocumentExtractor';
import { usePythonMultiDocumentExtractor } from './usePythonMultiDocumentExtractor';
interface UploadDocumentComponentIF {
    template?: any;
    closeDialog: () => void;
}

export const UploadDocumentComponentNew: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template }) => {
    const toast = useToastStore();
    const [latestTemplate, setLatestTemplate] = useState<any>(null);
    const navigate = useNavigate();
    const { addToNodeJsDocumentExtractor } = useNodeJsDocumentExtractor();
    const { addToPythonSingleDocumentExtractor } = usePythonSingleDocumentExtractor();
    const { addToPythonMultiDocumentExtractor } = usePythonMultiDocumentExtractor();

    useEffect(() => {
        if (!template._id) {
            toast.error('Template not found, Please select a template');
            closeDialog();
            return;
        }
        const getTemplate = async () => {
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/template/${template._id}`);
            const templateSettings = res.data?.settings;
            if (!templateSettings) {
                toast.error('Template settings not found, Please update template settings');
                closeDialog();
                setTimeout(() => {
                    navigate(`/docsnap/template/settings/${template._id}`);
                }, 2000);
                return;
            }
            toast.info(`Selected Extraction engine: ${templateSettings?.extractionEngine}`, { duration: 2000 });
            setLatestTemplate(res.data);
        };
        getTemplate();
    }, []);
    const onFileDrop = async (files: File[]) => {
        const templateSettings = latestTemplate?.settings;
        if (templateSettings?.extractionEngine === 'node') {
            addToNodeJsDocumentExtractor(files, latestTemplate);
        } else {
            if (templateSettings?.extractSingleDocument) {
                addToPythonSingleDocumentExtractor(files, latestTemplate);
            } else {
                addToPythonMultiDocumentExtractor(files, latestTemplate);
            }
        }
    };

    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
            name="Upload Documents"
            isOpen={true}
            closeDialog={closeDialog}
        >
            <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10">
                <DragAndDropFileInput accept="application/pdf,image/*" onFilesChange={onFileDrop} />
            </div>
        </DialogComponent>
    );
};
