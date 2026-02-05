import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import DragAndDropFileInput from '../../../components/DragAndDropFileInput';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import httpRequest from '../../../global-utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { config } from '../../../config/default';
import { useDocumentExtractor } from './useDocumentExtractor';
import { excelFileToArrayOfObjects } from '../../../global-utils/excelFileToArrayOfObjects';
import { groupVariationsByPageCount } from './functions/groupVariationsByPageCount';
import { createProductWithVariationGroups } from './functions/createProductWithVariationGroups';
import { SegregatedData, SegregatedDocuments } from './SegregatedDocuments';
interface UploadDocumentComponentIF {
    template?: any;
    closeDialog: () => void;
}

export const UploadDocumentComponentNew: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template }) => {
    const toast = useToastStore();
    const [latestTemplate, setLatestTemplate] = useState<any>(null);
    const navigate = useNavigate();
    const { addToDocumentExtractor } = useDocumentExtractor();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showCreateBlogForm, setShowCreateBlogForm] = useState(false);
    const [showSegregatedDocuments, setShowSegregatedDocuments] = useState(false);

    // console.log('selectedFiles:===========', selectedFiles);

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

            const excelData = await excelFileToArrayOfObjects(files[0]);
            const groupedVariations = groupVariationsByPageCount(excelData);
            const products = createProductWithVariationGroups(groupedVariations);
            const selectedProducts = products.slice(0, Number(template?.settings?.extractionLimit) || 10);
            selectedProducts.forEach(product => {
                addToDocumentExtractor(latestTemplate, [], product);
            });
        } else if (template?.settings?.module === 'content-creation') {
            if (!files[0].name.endsWith('.xlsx')) {
                toast.error('Only .xlsx file type is supported');
                return;
            }

            const excelRows = await excelFileToArrayOfObjects(files[0]);
            const selectedProducts = excelRows.slice(0, Number(template?.settings?.extractionLimit) || 10);
            selectedProducts.forEach((row: any) => {
                addToDocumentExtractor(latestTemplate, [], row);
            });
        } else if (template?.settings?.extractMultipleDocuments) {
            setSelectedFiles(files);
            setShowSegregatedDocuments(true);
        } else {
            addToDocumentExtractor(latestTemplate, files);
        }
    };

    let supportedFileTypes = ['application/pdf', 'image/*'];
    const module = sessionStorage.getItem('module');
    if (module === 'invoice-tracking') {
        supportedFileTypes.push('.xls');
    }
    if (module === 'data-entry' || module === 'content-creation') {
        supportedFileTypes = ['.xlsx'];
    }

    const addSegregatedDocumentsToExtraction = (files: SegregatedData) => {
        files.forEach(file => {
            file.forEach(doc => {
                const s3ImageNames = doc.pages.map(page => page.s3ImageName);
                addToDocumentExtractor(latestTemplate, selectedFiles, undefined, { documentNumber: doc.documentNumber, s3ImageNames });
            });
        });
    };

    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
            name="Upload Documents"
            isOpen={true}
            closeDialog={closeDialog}
        >
            <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10 pt-5">
                {module === 'content-creation' && (
                    <div className="mb-4 flex justify-end">
                        <Button onClick={() => setShowCreateBlogForm(true)}>Add Manually</Button>
                    </div>
                )}
                {showCreateBlogForm && (
                    <UseFormbuilder
                        isOpen={showCreateBlogForm}
                        title="Create Blog Form"
                        name="Create Blog Form"
                        className="w-230"
                        existingData={{}}
                        onSubmit={e => {
                            addToDocumentExtractor(latestTemplate, [], e);
                            setShowCreateBlogForm(false);
                        }}
                        closeDialog={() => setShowCreateBlogForm(false)}
                    />
                )}
                {showSegregatedDocuments && (
                    <SegregatedDocuments
                        selectedFiles={selectedFiles}
                        isOpen={showSegregatedDocuments}
                        closeDialog={closeDialog}
                        onSubmit={addSegregatedDocumentsToExtraction}
                    />
                )}
                <DragAndDropFileInput accept={supportedFileTypes.join(', ')} onFilesChange={onFileDrop} />
            </div>
        </DialogComponent>
    );
};
