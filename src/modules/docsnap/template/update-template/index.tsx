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
}
const initialState: UpdateTemplateStateIF = {
    sectionList: [],
    loadingS3File: false,
    loadingTemplate: false,
    images: []
};

const UpdateTemplatePage: React.FC = () => {
    const [state, setState] = useState<UpdateTemplateStateIF>(initialState);

    return (
        <UpdateTemplateStateProvider value={{ state, setState }}>
            <PageContainer className="gap-4 overflow-hidden p-6 pb-0">
                <Breadcrumbs page="updateTemplate" />
                <PageNameComponent name="Update Template" showBackButton />
                <ResizableContainer
                    left={<ImageViewer images={state.images} name="Purchase Order" />}
                    right={<FieldsContainer />}
                    initialLeftWidthPercent={60}
                    minLeftWidthPercent={40}
                    maxLeftWidthPercent={65}
                />
            </PageContainer>
        </UpdateTemplateStateProvider>
    );
};

export default UpdateTemplatePage;
