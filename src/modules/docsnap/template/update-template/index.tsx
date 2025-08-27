import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { FieldsContainer } from './FieldsContainer';
import { ImageViewer } from './components/ImageViewer';
import { ResizableContainer } from './components/ResizableContainer';
import { UpdateTemplateStateProvider } from './hooks/updateTemplateContext';
import { useState } from 'react';

export interface UpdateTemplateStateIF {
    sectionList: any[];
    loadingS3File: boolean;
    loadingTemplate: boolean;
    images: any[];
    updatingTemplate: boolean;
    templateData: any;
    showCreateForm: boolean;
    generatingTemplateFieldsWithAI: boolean;
}
const initialState: UpdateTemplateStateIF = {
    sectionList: [],
    loadingS3File: false,
    loadingTemplate: false,
    images: [],
    updatingTemplate: false,
    templateData: null,
    showCreateForm: false,
    generatingTemplateFieldsWithAI: false
};

const UpdateTemplatePage: React.FC<{ create?: boolean }> = ({ create }) => {
    const [state, setState] = useState<UpdateTemplateStateIF>(initialState);

    return (
        <UpdateTemplateStateProvider value={{ state, setState }}>
            <PageContainer className="gap-4 overflow-hidden p-6 pb-0">
                <Breadcrumbs page="updateTemplate" />
                <PageNameComponent name={create ? 'Create Template' : 'Update Template'} showBackButton />
                <ResizableContainer
                    left={<ImageViewer images={state.images} name="Document" />}
                    right={<FieldsContainer create={create} />}
                    initialLeftWidthPercent={60}
                    minLeftWidthPercent={40}
                    maxLeftWidthPercent={65}
                />
            </PageContainer>
        </UpdateTemplateStateProvider>
    );
};

export default UpdateTemplatePage;

const sampleInput = {
    basic_details: {
        group_instruction: 'Instructions for extracting basic details from OCR text',
        po_number: 'Instructions for extracting purchase order number from OCR text',
        date: 'Instructions for extracting purchase order date number from OCR text'
    },
    line_items: [
        {
            group_instruction: 'Instruction for table extraction',
            sku_number: 'Instructions for extracting SKU number from OCR text',
            description: 'Instructions for extracting description from OCR text'
        }
    ]
};

const sampleOutput = [
    {
        name: 'Basic Details',
        dataType: 'object',
        jsonKey: 'basic_details',
        subFields: [
            {
                name: 'PO Number',
                jsonKey: 'po_number',
                dataType: 'str',
                description: 'PO Number',
                instruction: 'Instructions for extracting purchase order number from OCR text',
                excludeExtraction: false,
                isHidden: false,
                required: false
            },
            {
                name: 'Date',
                jsonKey: 'date',
                dataType: 'str',
                description: 'Date',
                instruction: 'Instructions for extracting purchase order date number from OCR text',
                excludeExtraction: false,
                isHidden: false,
                required: false
            }
        ],
        description: 'basic details',
        instruction: 'Instructions for extracting basic details from OCR text',
        excludeExtraction: false,
        isHidden: false
    },
    {
        name: 'Line Items',
        dataType: 'array',
        jsonKey: 'line_items',
        subFields: [
            {
                name: 'SKU Number',
                jsonKey: 'sku_number',
                dataType: 'str',
                description: 'SKU',
                instruction: 'Instructions for extracting SKU number from OCR text',
                excludeExtraction: false,
                isHidden: false,
                required: false
            },
            {
                name: 'Description',
                jsonKey: 'description',
                dataType: 'str',
                description: 'description',
                instruction: 'Instructions for extracting description from OCR text',
                excludeExtraction: false,
                isHidden: false,
                required: false
            }
        ],
        description: 'line items',
        instruction: 'Instruction for table extraction',
        excludeExtraction: false,
        isHidden: false
    }
];
