import { useRef, useState } from 'react';
import { useViewRecordState, ViewRecordStateProvider } from './hooks/viewRecordContext';
import { TabViewContainer } from './components/TabViewContainer';
import DocumentBotComponent from './DocumentBotComponent';
import ExtractedDataComponent from './ExtractedDataComponent';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';
import { ResizableContainer } from '../../template/update-template/components/ResizableContainer';
import { PreviewComponent } from './PreviewComponent';
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

export interface Message {
  text: string;
  source?: string[];
  userMessage: boolean;
}
export interface ViewRecordStateIF {
  showCreateDialog: boolean;
  loadingData: boolean;
  loadingS3File: boolean;
  tabIndex: number;
  id: string;
  extractedData: Record<string, any>;
  objectFields: Record<string, Record<string, any>>;
  arrayFields: Array<Record<string, Record<string, any>>>;
  tableNames: Array<string>;
  wire: WirePoints | null;
  bbox: BboxIF | null;
  hoveredFieldId: string | null;
  pageNumber: number;
  images: any[];
  record: any;
  messages: Message[];
  chatLoading: boolean;
  tableViewDialog: boolean;
  scrollToViewField: number;
  selectedTableName: string;
  hoveredOnArrayField: boolean;
  autoFocusTriggered: boolean;
}
const initialState = {
  showCreateDialog: false,
  loadingData: false,
  loadingS3File: false,
  tabIndex: 0,
  id: '',
  extractedData: {},
  objectFields: {},
  arrayFields: [],
  tableNames: [],
  wire: null,
  bbox: null,
  hoveredFieldId: null,
  pageNumber: 1,
  images: [],
  record: null,
  messages: [],
  chatLoading: false,
  tableViewDialog: false,
  scrollToViewField: 1,
  selectedTableName: '',
  hoveredOnArrayField: false,
  autoFocusTriggered: false,
};

const ViewRecordPage: React.FC = () => {
  const [state, setState] = useState<ViewRecordStateIF>(initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <ViewRecordStateProvider value={{ state, setState }}>
      <div className={`absolute top-0 left-0 flex h-[100vh] w-[100vw] gap-2 bg-white ${state.selectedTableName ? 'pb-[40vh]' : 'pb-0'}`} ref={containerRef}>
        {/* <DocumentPreviewComponent containerRef={containerRef} fieldRefs={fieldRefs} /> */}
        <ResizableContainer
          left={<LeftContainer containerRef={containerRef} fieldRefs={fieldRefs} />}
          right={<RightContainer containerRef={containerRef} fieldRefs={fieldRefs} />}
          initialLeftWidthPercent={75}
          minLeftWidthPercent={60}
          maxLeftWidthPercent={80}
        />
        {state.selectedTableName && (
          <div className="absolute bottom-0 left-0 z-1 flex h-[40vh] w-full flex-col overflow-hidden border-t border-blue-200 bg-gray-50 p-2">
            <RenderArrayFields refs={{ fieldRefs, isScrollingRef: 0, containerRef }} updateWire={() => {}} />
          </div>
        )}
      </div>
    </ViewRecordStateProvider>
  );
};

export default ViewRecordPage;

const LeftContainer = ({ containerRef, fieldRefs }: { containerRef: any; fieldRefs: any }) => {
  const { state } = useViewRecordState();
  return (
    <div className="flex h-[100vh] flex-1 flex-col overflow-hidden">
      {/* <DocumentPreviewComponent containerRef={containerRef} fieldRefs={fieldRefs} /> */}
      <PreviewComponent fieldRefs={fieldRefs} containerRef={containerRef} />
    </div>
  );
};

const RightContainer = ({ containerRef, fieldRefs }: { containerRef: any; fieldRefs: any }) => {
  return (
    <div className="flex h-[100vh] flex-1 flex-col overflow-hidden">
      <TabViewContainer>
        <ExtractedDataComponent containerRef={containerRef} fieldRefs={fieldRefs} />
        <DocumentBotComponent />
      </TabViewContainer>
    </div>
  );
};
