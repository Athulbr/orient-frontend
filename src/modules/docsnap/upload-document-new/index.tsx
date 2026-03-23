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
import * as XLSX from 'xlsx';
import { Download, Check, ChevronDown } from 'lucide-react';
import Spinner from '../../../components/Spinner';

interface KeywordItem {
    keyword: string;
    source: string;
    selected: boolean;
}

interface KeywordGroup {
    name: string;
    primary_keyword: string;
    keywords: KeywordItem[];
}

interface UploadDocumentComponentIF {
    template?: any;
    closeDialog: () => void;
    showManualInputForm?: boolean;
    setShowManualInputForm?: (value: boolean) => void;
}

export const UploadDocumentComponentNew: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template, showManualInputForm = false, setShowManualInputForm }) => {
    const toast = useToastStore();
    const [latestTemplate, setLatestTemplate] = useState<any>(null);
    const navigate = useNavigate();
    const { addToDocumentExtractor } = useDocumentExtractor();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showSegregatedDocuments, setShowSegregatedDocuments] = useState(false);
    const module = sessionStorage.getItem('module');

    // Content-creation keyword state
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
    const [pendingRows, setPendingRows] = useState<any[]>([]);
    const [isSubmittingExtraction, setIsSubmittingExtraction] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

    const toggleGroupCollapse = (gi: number) => {
        setCollapsedGroups(prev => {
            const allIndices = keywordGroups.map((_, i) => i);
            if (prev.has(gi)) {
                // gi is collapsed → open it, collapse all others
                const next = new Set(allIndices);
                next.delete(gi);
                return next;
            }
            // gi is open → collapse it
            return new Set(allIndices);
        });
    };

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

            // Filter out purely empty rows and the instructional row
            const validRows = excelRows.filter((row: any) => {
                const values = Object.values(row);
                return values.some((val: any) =>
                    val &&
                    String(val).trim() !== '' &&
                    !String(val).includes('links should be comma seperated')
                );
            });

            const selectedProducts = validRows.slice(0, Number(template?.settings?.extractionLimit) || 10);

            // Fetch SEO keywords for the uploaded rows
            setIsFetchingKeywords(true);
            setPendingRows(selectedProducts);
            setKeywordGroups([]);
            try {
                const res = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/get-keywords`, {
                    rows: selectedProducts
                });
                const fetched: KeywordGroup[] = (res.data || []).map((group: any) => ({
                    name: group.name,
                    primary_keyword: group.primary_keyword,
                    keywords: (group.keywords || []).map((item: any) => ({
                        keyword: item.keyword,
                        source: item.source,
                        selected: true
                    }))
                }));
                setKeywordGroups(fetched);
                // collapse all groups except the first
                setCollapsedGroups(new Set(fetched.map((_, i) => i).slice(1)));
            } catch (e) {
                toast.error('Failed to fetch SEO keywords');
                // Proceed without keywords on error
                selectedProducts.forEach((row: any) => {
                    addToDocumentExtractor(latestTemplate, [], row);
                });
                closeDialog();
            } finally {
                setIsFetchingKeywords(false);
            }
        } else if (template?.settings?.extractMultipleDocuments) {
            setSelectedFiles(files);
            setShowSegregatedDocuments(true);
        } else {
            addToDocumentExtractor(latestTemplate, files);
        }
    };

    const handleToggleKeyword = (groupIndex: number, kwIndex: number) => {
        setKeywordGroups(prev => prev.map((g, gi) =>
            gi !== groupIndex ? g : {
                ...g,
                keywords: g.keywords.map((k, ki) => ki === kwIndex ? { ...k, selected: !k.selected } : k)
            }
        ));
    };

    const handleSelectAllInGroup = (groupIndex: number, selectAll: boolean) => {
        setKeywordGroups(prev => prev.map((g, gi) =>
            gi !== groupIndex ? g : { ...g, keywords: g.keywords.map(k => ({ ...k, selected: selectAll })) }
        ));
    };

    const handleSelectAllKeywords = (selectAll: boolean) => {
        setKeywordGroups(prev => prev.map(g => ({ ...g, keywords: g.keywords.map(k => ({ ...k, selected: selectAll })) })));
    };

    const totalSelected = keywordGroups.reduce((acc, g) => acc + g.keywords.filter(k => k.selected).length, 0);
    const totalKeywords = keywordGroups.reduce((acc, g) => acc + g.keywords.length, 0);

    const handleProceedWithKeywords = () => {
        setIsSubmittingExtraction(true);
        pendingRows.forEach((row: any) => {
            // Find the matching group by name or primary_keyword
            const matchingGroup = keywordGroups.find(
                g => g.name === row.name || g.primary_keyword === row.primary_keyword
            );
            const selectedKeywords = matchingGroup
                ? matchingGroup.keywords.filter(k => k.selected)
                : [];
            addToDocumentExtractor(latestTemplate, [], { ...row, selectedKeywords });
        });
        setIsSubmittingExtraction(false);
        closeDialog();
    };

    let supportedFileTypes = ['application/pdf', 'image/*'];
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

    const downloadSampleExcel = () => {
        const module = sessionStorage.getItem('module');

        if (module === 'data-entry') {
            const headers = [
                'Page Count',
                'Variation Style',
                'Product or Variation',
                'SKU',
                'Description',
                "Manufacturer's URL",
                'UOM',
                'Quantity',
                'Cost',
                'CSFP',
                'CSFP Fixed Margin',
                'Dealer Shipping Cost',
                'Additional Fees',
                'Price Method',
                'MAP',
                'Vendor Code',
                'Product Vendor',
                'Product Manufacturer',
                'Product Category',
            ];

            const rows = [
                ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ];

            const worksheetData = [headers, ...rows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
            XLSX.writeFile(workbook, 'data_entry_sample.xlsx');
        } else {
            const headers1 = [
                'name',
                'description',
                'primary_keyword',
                // 'author',
                'product_links',
            ];

            const sampleRow1 = [
                '',
                '',
                '',
                // '',
                // '',
                'links should be comma seperated eg:-https://www.example_1.com,https://www.example_2.com/blogs.html,https://www.example_3.com/products.html'
            ];

            const worksheetData1 = [headers1, sampleRow1, Array(headers1.length).fill(''), Array(headers1.length).fill('')];
            const worksheet1 = XLSX.utils.aoa_to_sheet(worksheetData1);
            const workbook1 = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook1, worksheet1, 'Sample');
            XLSX.writeFile(workbook1, 'content_creation_sample.xlsx');
        }
    };

    if (showManualInputForm) {
        return (
            <UseFormbuilder
                isOpen={true}
                title="Create Blog Form"
                name="Create Blog Form"
                className="w-230"
                existingData={{}}
                onSubmit={e => {
                    addToDocumentExtractor(latestTemplate, [], e);
                }}
                closeDialog={() => {
                    closeDialog();
                    setShowManualInputForm && setShowManualInputForm(false);
                }}
            />
        );
    }

    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col"
            name="Bulk Import"
            isOpen={true}
            closeDialog={closeDialog}
        >
            <div className="flex w-full min-h-0 flex-1 flex-col overflow-hidden p-10 pt-5">
                {(module === 'content-creation' || module === 'data-entry') && (
                    <div className="flex w-full justify-end mb-4">
                        <Button startIcon={<Download size={14} className="text-gray-500" />} outlined onClick={downloadSampleExcel}>
                            Sample Input File
                        </Button>
                    </div>
                )}

                {showSegregatedDocuments && (
                    <SegregatedDocuments
                        selectedFiles={selectedFiles}
                        isOpen={showSegregatedDocuments}
                        closeDialog={closeDialog}
                        onSubmit={addSegregatedDocumentsToExtraction}
                    />
                )}

                {/* Keyword loading indicator */}
                {isFetchingKeywords && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <Spinner size={32} />
                        <p className="text-sm text-gray-500">Fetching SEO keywords for your content...</p>
                    </div>
                )}

                {/* Keyword selection — grouped by name */}
                {!isFetchingKeywords && keywordGroups.length > 0 && (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                        {/* Global header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-semibold text-gray-800">SEO Keywords</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {totalSelected} of {totalKeywords} selected across {keywordGroups.length} product{keywordGroups.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSelectAllKeywords(true)} className="text-xs text-blue-600 hover:underline cursor-pointer">Select All</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleSelectAllKeywords(false)} className="text-xs text-gray-500 hover:underline cursor-pointer">Deselect All</button>
                            </div>
                        </div>

                        {/* Per-group sections — scrollable */}
                        <div className="show-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                            {keywordGroups.map((group, gi) => {
                                const groupSelected = group.keywords.filter(k => k.selected).length;
                                const allGroupSelected = groupSelected === group.keywords.length;
                                const isCollapsed = collapsedGroups.has(gi);
                                return (
                                    <div key={gi} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                                        {/* Group header — click to collapse/expand */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleGroupCollapse(gi)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                                                />
                                                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    {groupSelected}/{group.keywords.length}
                                                </span>
                                                <p className="text-sm font-semibold text-gray-800 capitalize">{group.name}</p>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleSelectAllInGroup(gi, !allGroupSelected); }}
                                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                                            >
                                                {allGroupSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {/* Keywords grid — hidden when collapsed */}
                                        {!isCollapsed && (
                                            <div className="px-4 pb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                                                {group.keywords.map((kw, ki) => (
                                                    <button
                                                        key={ki}
                                                        onClick={() => handleToggleKeyword(gi, ki)}
                                                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                                                            kw.selected
                                                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                                            kw.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {kw.selected && <Check size={9} className="text-white" strokeWidth={3} />}
                                                        </span>
                                                        <span className="leading-snug break-words">{kw.keyword}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button outlined onClick={closeDialog}>Cancel</Button>
                            <Button
                                onClick={handleProceedWithKeywords}
                                disabled={isSubmittingExtraction}
                                startIcon={isSubmittingExtraction ? <Spinner size={14} /> : null}
                            >
                                {isSubmittingExtraction ? 'Processing...' : `Proceed with ${totalSelected} Keywords`}
                            </Button>
                        </div>
                    </div>
                )}

                {!isFetchingKeywords && keywordGroups.length === 0 && (
                    <DragAndDropFileInput accept={supportedFileTypes.join(', ')} onFilesChange={onFileDrop} />
                )}
            </div>
        </DialogComponent>
    );
};
