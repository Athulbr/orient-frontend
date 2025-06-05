import { useRef, useState } from 'react';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { DocumentPreviewComponent } from './DocumentPreview';
import { ViewRecordStateProvider } from './hooks/viewRecordContext';
import { TabViewContainer } from './components/TabViewContainer';
import DocumentBotComponent from './DocumentBotComponent';
import ExtractedDataComponent from './ExtractedDataComponent';
import { AnnotationLine } from './components/AnnotationLine';

interface WirePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface BboxIF {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}
export interface ViewRecordStateIF {
  showCreateDialog: boolean;
  loadingData: boolean;
  loadingS3File: boolean;
  tabIndex: number;
  id: string;
  extractedData: Record<string, any>;
  topLevelFields: Record<string, any>;
  objectFields: Record<string, Record<string, any>>;
  arrayFields: Array<Record<string, Record<string, any>>>;
  tableNames: Array<string>;
  wire: WirePoints | null;
  bbox: BboxIF | null;
  hoveredFieldId: string | null;
  pageNumber: number;
  images: any[];
  record: any;
}
const initialState = {
  showCreateDialog: false,
  loadingData: false,
  loadingS3File: false,
  tabIndex: 0,
  id: '',
  extractedData: {},
  topLevelFields: {},
  objectFields: {},
  arrayFields: [],
  tableNames: [],
  wire: null,
  bbox: null,
  hoveredFieldId: null,
  pageNumber: 1,
  images: [],
  record: null,
};

const ViewRecordPage: React.FC = () => {
  const [state, setState] = useState<ViewRecordStateIF>(initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <ViewRecordStateProvider value={{ state, setState }}>
      <PageContainer className="gap-2">
        <PageNameComponent name="View Record" showBackButton />
        <div className="relative flex flex-1 overflow-y-auto" ref={containerRef}>
          <DocumentPreviewComponent containerRef={containerRef} />
          <TabViewContainer>
            <ExtractedDataComponent containerRef={containerRef} />
            <DocumentBotComponent />
          </TabViewContainer>
          <AnnotationLine />
        </div>
      </PageContainer>
    </ViewRecordStateProvider>
  );
};

export default ViewRecordPage;
