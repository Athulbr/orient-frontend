import { useEffect, useRef, useState } from 'react';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { DocumentPreviewComponent } from './DocumentPreview';
import { ViewRecordStateProvider } from './hooks/viewRecordContext';
import { TabViewContainer } from './components/TabViewContainer';
import DocumentBotComponent from './DocumentBotComponent';
import ExtractedDataComponent from './ExtractedDataComponent';
import { AnnotationLine } from './components/AnnotationLine';
import { useParams } from 'react-router-dom';
import { useViewRecordApi } from './hooks/useViewRecordApi';
import { useViewRecordGlobalStore } from './hooks/useViewRecordGlobalStore';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';

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
  messages: Message[];
  chatLoading: boolean;
  tableViewDialog: boolean;
  hideWire: boolean;
  scrollToViewField: number;
  selectedTableName: string;
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
  messages: [],
  chatLoading: false,
  tableViewDialog: false,
  hideWire: false,
  scrollToViewField: 1,
  selectedTableName: '',
};

const ViewRecordPage: React.FC = () => {
  const [state, setState] = useState<ViewRecordStateIF>(initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastHoveredFieldRef = useRef<any[] | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <ViewRecordStateProvider value={{ state, setState }}>
      <div className={`absolute top-0 left-0 flex h-[100vh] w-[100vw] gap-2 bg-white ${state.selectedTableName ? 'pb-[30vh]' : 'pb-0'}`} ref={containerRef}>
        <DocumentPreviewComponent containerRef={containerRef} lastHoveredFieldRef={lastHoveredFieldRef} />
        <TabViewContainer>
          <ExtractedDataComponent containerRef={containerRef} lastHoveredFieldRef={lastHoveredFieldRef} fieldRefs={fieldRefs} />
          <DocumentBotComponent />
        </TabViewContainer>
        <AnnotationLine />
        {state.selectedTableName && (
          <div className="absolute bottom-0 left-0 z-1 h-[30vh] w-full overflow-hidden border-t border-blue-200 bg-gray-50 p-2">
            <RenderArrayFields refs={{ fieldRefs, isScrollingRef: 0, lastHoveredFieldRef, containerRef }} updateWire={() => {}} />
          </div>
        )}
      </div>
    </ViewRecordStateProvider>
  );
};

export default ViewRecordPage;
