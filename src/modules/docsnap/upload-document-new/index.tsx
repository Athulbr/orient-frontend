import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import DragAndDropFileInput from '../../../components/DragAndDropFileInput';
import { useNavigate } from 'react-router-dom';
import httpRequest from '../../../global-utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { config } from '../../../config/default';
import { useDocumentExtractor } from './useDocumentExtractor';
import { excelFileToArrayOfObjects } from '../../../global-utils/excelFileToArrayOfObjects';
import { groupVariationsByPageCount } from './functions/groupVariationsByPageCount';
import { createProductWithVariationGroups } from './functions/createProductWithVariationGroups';
interface UploadDocumentComponentIF {
    template?: any;
    closeDialog: () => void;
}

export const UploadDocumentComponentNew: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template }) => {
    const toast = useToastStore();
    const [latestTemplate, setLatestTemplate] = useState<any>(null);
    const navigate = useNavigate();
    const { addToDocumentExtractor } = useDocumentExtractor();
    const [selectedProducts, setSelectedProducts] = useState<any>([]);

    useEffect(() => {
        if (!template._id) {
            toast.error('Template not found, Please select a template');
            closeDialog();
            return;
        }
        const getTemplate = async () => {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${template._id}`);
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
        if (template?.settings?.module === 'data-entry') {
            if (!files[0].name.endsWith('.xlsx')) {
                toast.error('Only .xlsx file type is supported');
                return;
            }

            const csvData = await excelFileToArrayOfObjects(files[0]);
            const groupedVariations = groupVariationsByPageCount(csvData);
            const products = createProductWithVariationGroups(groupedVariations);
            const selectedProducts = products.slice(0, Number(template?.settings?.extractionLimit) || 10);
            setSelectedProducts(selectedProducts);
            selectedProducts.forEach(product => {
                addToDocumentExtractor(latestTemplate, [], product);
            });
        } else {
            addToDocumentExtractor(latestTemplate, files);
        }
    };

    let supportedFileTypes = ['application/pdf', 'image/*'];
    if (sessionStorage.getItem('module') === 'data-entry') {
        supportedFileTypes = ['.xlsx'];
    }

    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
            name="Upload Documents"
            isOpen={true}
            closeDialog={closeDialog}
        >
            <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10">
                <DragAndDropFileInput accept={supportedFileTypes.join(', ')} onFilesChange={onFileDrop} />
            </div>
        </DialogComponent>
    );
};
