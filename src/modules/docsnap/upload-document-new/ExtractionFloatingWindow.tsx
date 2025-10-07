import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, CircleAlert, CircleX, Loader, LoaderCircle } from 'lucide-react';
import { cn } from '../../../global-utils/twMerge';
import { useExtractionStore } from '../../../zustand-store/extractionStore';
import ProgressBar from '../../../components/ProgressBar';
import { useDraggable } from './useDraggable';
import Spinner from '../../../components/Spinner';

interface ExtractionFloatingWindowIF {
    test?: string;
}

const ExtractionFloatingWindow: React.FC<ExtractionFloatingWindowIF> = () => {
    const { extractionQueue, clearExtractionQueue } = useExtractionStore();
    const [minimize, setMinimize] = useState(false);

    const { ref, position, isDragging, handleMouseDown } = useDraggable<HTMLDivElement>();

    if (!extractionQueue.length) return null;

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="text-green-500" />;
            case 'failed':
                return <CircleAlert className="text-red-500" />;
            default:
                return <LoaderCircle size={18} className="text-amber-500 animate-spin" />;
        }
    };
    const getProgressUI = (step: string, progress: number) => {
        return (
            <div className="flex flex-col text-xs w-full">
                <span className="text-amber-500">{step}</span>
                <div className="flex items-center gap-3">
                    <ProgressBar value={progress} />
                    <span className="text-[10px] text-amber-500">{progress}%</span>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            className="fixed z-10000 bottom-2 right-2 flex w-120 flex-col gap-2 rounded-lg border bg-white shadow-lg shadow-gray-600"
            style={{
                right: position.x === 0 ? '1rem' : 'auto',
                bottom: position.x === 0 ? '1rem' : 'auto',
                left: position.x !== 0 ? `${position.x}px` : 'auto',
                top: position.y !== 0 ? `${position.y}px` : 'auto',
                cursor: isDragging ? 'grabbing' : 'default'
            }}
        >
            <div
                className={cn('flex w-full items-center justify-between border-b p-4 text-lg font-semibold', 'cursor-grab active:cursor-grabbing select-none')}
                onMouseDown={handleMouseDown}
            >
                Extraction Status
                <div className="flex gap-3 items-center">
                    <span className="text-sm text-green-500 font-light">
                        ({extractionQueue.filter((i: any) => i.status === 'Complete').length}/{extractionQueue.length})
                    </span>
                    {minimize ? (
                        <ChevronRight
                            size={22}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMinimize(false);
                            }}
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    ) : (
                        <ChevronDown
                            size={22}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMinimize(true);
                            }}
                            onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    )}
                    <CircleX
                        size={20}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            clearExtractionQueue();
                        }}
                        onMouseDown={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            {!minimize && (
                <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4">
                    {extractionQueue.map((file: any, idx: number) => (
                        <div
                            key={idx}
                            className={cn(
                                'flex items-center flex-col justify-between gap-2 border p-4 rounded-lg border-l-4 border-l-amber-500',
                                file.status === 'completed' ? 'border-l-green-500' : file.status === 'failed' ? 'border-l-red-500' : ''
                            )}
                        >
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center">
                                    <p className="truncate text-sm">{file.fileName}</p>
                                    &nbsp;&nbsp;
                                    <span className="text-sm text-nowrap text-green-600">( {file.time}s )</span>
                                </div>
                                {getStatusUI(file.status)}
                            </div>
                            {file.status === 'processing' && getProgressUI(file.step, file.progress)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExtractionFloatingWindow;

const sampleTemplate = {
    fields: [
        {
            name: 'Basic Details',
            dataType: 'dict',
            jsonKey: 'basic_details',
            regenerateFieldValueWithAI: false,
            excludeExtraction: false,
            description: 'basic details',
            isHidden: false,
            subFields: [
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Dealer Name',
                    dataType: 'str',
                    jsonKey: 'dealer_name',
                    validationUrl: '',
                    postProcessingScript: '',
                    required: false,
                    excludeExtraction: false,
                    description: 'dealer name',
                    instruction: 'Extract main dealer name from top section (before product details). Ignore buyer/consignee sections.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6a9'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Dealer Branch',
                    dataType: 'str',
                    jsonKey: 'dealer_branch',
                    required: false,
                    excludeExtraction: false,
                    description: 'dealer branch',
                    instruction: 'Extract dealer branch/city from top section. Normalize to Title Case (e.g., Raipur).',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6aa'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Sub Dealer',
                    dataType: 'str',
                    jsonKey: 'sub_dealer',
                    required: false,
                    excludeExtraction: false,
                    description: 'sub dealer',
                    instruction:
                        "Extract the name of the Sub-dealer from the document.\\nThis is typically labeled as 'Buyer', 'Consignee', or 'Ship To'.\\nLook below the Main Dealer section, after the top portion of the document.\\nPrioritize the first 'Buyer', 'Consignee', or 'Ship To' label.",
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ab'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Invoice Number',
                    dataType: 'str',
                    jsonKey: 'invoice_number',
                    required: false,
                    excludeExtraction: false,
                    description: 'invoice number',
                    instruction: 'Extract invoice number.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ac'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Invoice Date',
                    dataType: 'str',
                    jsonKey: 'invoice_date',
                    required: false,
                    excludeExtraction: false,
                    description: 'invoice date',
                    instruction: 'Extract invoice date.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ad'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Delivery Note',
                    dataType: 'str',
                    jsonKey: 'delivery_note',
                    required: false,
                    excludeExtraction: false,
                    description: 'delivery note',
                    instruction: 'Extract delivery note number.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ae'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Delivery Note Date',
                    dataType: 'str',
                    jsonKey: 'delivery_note_date',
                    required: false,
                    excludeExtraction: false,
                    description: 'delivery note date',
                    instruction: 'Extract delivery note date.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6af'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Cgst',
                    dataType: 'str',
                    jsonKey: 'cgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'cgst',
                    instruction: 'Extract CGST amount.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b0'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Sgst',
                    dataType: 'str',
                    jsonKey: 'sgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'sgst',
                    instruction: 'Extract SGST amount.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b1'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Total Tax',
                    dataType: 'str',
                    jsonKey: 'total_tax',
                    required: false,
                    excludeExtraction: false,
                    description: 'total tax',
                    instruction: 'Extract total tax (CGST + SGST).',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b2'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Total Amount',
                    dataType: 'str',
                    jsonKey: 'total_amount',
                    required: false,
                    excludeExtraction: false,
                    description: 'total amount',
                    instruction: 'Extract total invoice amount.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b3'
                }
            ],
            _id: '68c3f7167f862e5987a0e6a8'
        },
        {
            name: 'Consignee',
            dataType: 'dict',
            jsonKey: 'consignee',
            regenerateFieldValueWithAI: false,
            excludeExtraction: false,
            description: 'consignee',
            isHidden: false,
            subFields: [
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Name',
                    dataType: 'str',
                    jsonKey: 'name',
                    required: false,
                    excludeExtraction: false,
                    description: 'name',
                    instruction: 'Extract consignee/ship-to name.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b5'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Street',
                    dataType: 'str',
                    jsonKey: 'street',
                    required: false,
                    excludeExtraction: false,
                    description: 'street',
                    instruction: 'Extract consignee street address.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b6'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'City',
                    dataType: 'str',
                    jsonKey: 'city',
                    required: false,
                    excludeExtraction: false,
                    description: 'city',
                    instruction: 'Extract consignee city.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b7'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'State',
                    dataType: 'str',
                    jsonKey: 'state',
                    required: false,
                    excludeExtraction: false,
                    description: 'state',
                    instruction: 'Extract consignee state.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b8'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Zip',
                    dataType: 'str',
                    jsonKey: 'zip',
                    required: false,
                    excludeExtraction: false,
                    description: 'zip',
                    instruction: 'Extract consignee ZIP code.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6b9'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Gstin Uin',
                    dataType: 'str',
                    jsonKey: 'gstin_uin',
                    required: false,
                    excludeExtraction: false,
                    description: 'gstin uin',
                    instruction: 'Extract consignee GSTIN/UIN if present.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ba'
                }
            ],
            _id: '68c3f7167f862e5987a0e6b4'
        },
        {
            name: 'Buyer',
            dataType: 'dict',
            jsonKey: 'buyer',
            regenerateFieldValueWithAI: false,
            excludeExtraction: false,
            description: 'buyer',
            isHidden: false,
            subFields: [
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Name',
                    dataType: 'str',
                    jsonKey: 'name',
                    required: false,
                    excludeExtraction: false,
                    description: 'name',
                    instruction: 'Extract buyer/bill-to name.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6bc'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Street',
                    dataType: 'str',
                    jsonKey: 'street',
                    required: false,
                    excludeExtraction: false,
                    description: 'street',
                    instruction: 'Extract buyer street address.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6bd'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'City',
                    dataType: 'str',
                    jsonKey: 'city',
                    required: false,
                    excludeExtraction: false,
                    description: 'city',
                    instruction: 'Extract buyer city.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6be'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'State',
                    dataType: 'str',
                    jsonKey: 'state',
                    required: false,
                    excludeExtraction: false,
                    description: 'state',
                    instruction: 'Extract buyer state.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6bf'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Zip',
                    dataType: 'str',
                    jsonKey: 'zip',
                    required: false,
                    excludeExtraction: false,
                    description: 'zip',
                    instruction: 'Extract buyer ZIP code.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c0'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Gstin Uin',
                    dataType: 'str',
                    jsonKey: 'gstin_uin',
                    required: false,
                    excludeExtraction: false,
                    description: 'gstin uin',
                    instruction: 'Extract buyer GSTIN/UIN if present.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c1'
                }
            ],
            _id: '68c3f7167f862e5987a0e6bb'
        },
        {
            name: 'Line Items',
            dataType: 'list',
            jsonKey: 'line_items',
            regenerateFieldValueWithAI: false,
            excludeExtraction: false,
            description: 'line items',
            isHidden: false,
            subFields: [
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Table Instruction',
                    dataType: 'str',
                    jsonKey: 'table_instruction',
                    required: false,
                    excludeExtraction: false,
                    description: 'table instruction',
                    instruction:
                        'CRITICAL: Use image for table extraction, not OCR text. OCR often corrupts table data. Cross-reference table columns visually. Correct OCR mistakes by analyzing remaining data patterns (e.g., if quantities are 1,2,3,1222 → correct 1222 to reasonable value). Each row with HSN/SAC = one line item. Verify calculations: amount = quantity × rate ± discount ± tax. Check SGST = CGST (usually equal).',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c3'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Serial No',
                    dataType: 'str',
                    jsonKey: 'serial_no',
                    required: false,
                    excludeExtraction: false,
                    description: 'serial no',
                    instruction: 'Extract serial number or assign sequential order.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c4'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Description',
                    dataType: 'str',
                    jsonKey: 'description',
                    required: false,
                    excludeExtraction: false,
                    description: 'description',
                    instruction: 'Extract item description. Verify against image if OCR seems corrupted.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c5'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Hsn Sac',
                    dataType: 'str',
                    jsonKey: 'hsn_sac',
                    required: false,
                    excludeExtraction: false,
                    description: 'hsn sac',
                    instruction: 'Extract HSN/SAC code. Cross-check with image for accuracy.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c6'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Quantity',
                    dataType: 'str',
                    jsonKey: 'quantity',
                    required: false,
                    excludeExtraction: false,
                    description: 'quantity',
                    instruction: 'Extract quantity as integer. CRITICAL: Correct OCR errors by comparing with other quantities and logical patterns.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c7'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Rate',
                    dataType: 'str',
                    jsonKey: 'rate',
                    required: false,
                    excludeExtraction: false,
                    description: 'rate',
                    instruction: 'Extract rate as float. Verify calculations match amount = quantity × rate. Default: 0.0 if missing.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c8'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Per',
                    dataType: 'str',
                    jsonKey: 'per',
                    required: false,
                    excludeExtraction: false,
                    description: 'per',
                    instruction: "Extract 'per' unit if available.",
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6c9'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Discount',
                    dataType: 'str',
                    jsonKey: 'discount',
                    required: false,
                    excludeExtraction: false,
                    description: 'discount',
                    instruction: 'Extract discount percentage or amount. Check if calculations are consistent. Default: 0 if missing.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6ca'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Sgst',
                    dataType: 'str',
                    jsonKey: 'sgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'sgst',
                    instruction: 'Extract SGST amount. Should equal CGST in most cases.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6cb'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Cgst',
                    dataType: 'str',
                    jsonKey: 'cgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'cgst',
                    instruction: 'Extract CGST amount. Should equal SGST in most cases.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6cc'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Amount',
                    dataType: 'str',
                    jsonKey: 'amount',
                    required: false,
                    excludeExtraction: false,
                    description: 'amount',
                    instruction: 'Extract line item amount. Verify: amount = (quantity × rate) - discount + taxes.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6cd'
                }
            ],
            _id: '68c3f7167f862e5987a0e6c2'
        },
        {
            name: 'Bank Details',
            dataType: 'dict',
            jsonKey: 'bank_details',
            regenerateFieldValueWithAI: false,
            excludeExtraction: false,
            description: 'bank details',
            isHidden: false,
            subFields: [
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Bank Name',
                    dataType: 'str',
                    jsonKey: 'bank_name',
                    required: false,
                    excludeExtraction: false,
                    description: 'bank name',
                    instruction: 'Extract company bank name.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6cf'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Account Number',
                    dataType: 'str',
                    jsonKey: 'account_number',
                    required: false,
                    excludeExtraction: false,
                    description: 'account number',
                    instruction: 'Extract bank account number (may be labeled as A/c No.).',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6d0'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Branch Name',
                    dataType: 'str',
                    jsonKey: 'branch_name',
                    required: false,
                    excludeExtraction: false,
                    description: 'branch name',
                    instruction: 'Extract branch name if available.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6d1'
                },
                {
                    regenerateFieldValueWithAI: false,
                    name: 'Ifsc Code',
                    dataType: 'str',
                    jsonKey: 'ifsc_code',
                    required: false,
                    excludeExtraction: false,
                    description: 'ifsc code',
                    instruction: 'Extract IFSC/branch code if available.',
                    isHidden: false,
                    _id: '68c3f7167f862e5987a0e6d2'
                }
            ],
            _id: '68c3f7167f862e5987a0e6ce'
        }
    ],
    settings: {
        basicSettings: '',
        primaryLLMProvider: 'azure_openai', // azure_openai, openai, gemini
        secondaryLLMProvider: 'openai', // azure_openai, openai, gemini
        primaryLLMModel: 'gpt-4o-docsnap', //1  gpt-4o-docsnap, gpt-4o-mini-docsnap, gpt-4o, gpt-4o-mini
        secondaryLLMModel: 'gpt-4o', //2
        confidenceScore: 'ocr', // ocr, llm, none
        confidenceThresholdInPercentage: '60', //3 1 to 100
        alignmentCorrection: true,
        extractSingleDocument: true,
        includeImageForExtraction: true,
        enableChatWithDocument: true,
        enableInvoiceGenerator: true,
        developerSettings: '',
        documentDateKey: 'basic_details.invoice_date',
        automationId: '11',
        prefixRecordName: 'Ardex_',
        dynamicFileNameFirstKey: 'basic_details.dealer_name',
        dynamicFileNameLastKey: 'basic_details.invoice_number',
        extractionEngine: 'node', // node, python
        ocrEngine: 'googleVisionApi', // googleVisionApi, doctr
        enableOCR: true,
        dynamicFileName: true
    },
    name: 'ardex-new',
    description: 'aa',
    active: true
};
