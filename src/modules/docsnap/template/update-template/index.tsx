import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { FieldsContainer } from './FieldsContainer';
import { ImageViewer } from './components/ImageViewer';
import { ResizableContainer } from './components/ResizableContainer';
import { sampleImages, templateFields } from './components/temp';
import { UpdateTemplateStateProvider } from './hooks/updateTemplateContext';
import { useEffect, useState } from 'react';
import { useUpdateTemplatePageApi } from './hooks/useUpdateTemplateApi';
import { useParams } from 'react-router-dom';

export interface UpdateTemplateStateIF {
  sectionList: any[];
}
const initialState: UpdateTemplateStateIF = {
  sectionList: templateFields,
};

const UpdateTemplatePage: React.FC = () => {
  const [state, setState] = useState<UpdateTemplateStateIF>(initialState);

  return (
    <UpdateTemplateStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4 overflow-hidden p-6 pb-0">
        <Breadcrumbs page="updateTemplate" />
        <PageNameComponent name="Update Template" showBackButton />
        <ResizableContainer
          left={<ImageViewer images={sampleImages} name="Purchase Order" />}
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
