import { useRef, useState } from 'react';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { DocumentPreviewComponent } from './DocumentPreview';
import { ViewRecordStateProvider } from './hooks/viewRecordContext';
import { TabViewContainer } from './components/TabViewContainer';
import DocumentBotComponent from './DocumentBotComponent';
import ExtractedDataComponent from './ExtractedDataComponent';

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
  loading: boolean;
  tabIndex: number;
  id: string;
  extractedData: Record<string, any>;
  topLevelFields: Record<string, any>;
  objectFields: Record<string, any>;
  arrayFields: Array<Record<string, any>>;
  wire: WirePoints | null;
  bbox: BboxIF | null;
  hoveredFieldId: string | null;
}
const initialState = {
  showCreateDialog: false,
  loading: false,
  tabIndex: 0,
  id: '',
  extractedData: {},
  topLevelFields: {},
  objectFields: {},
  arrayFields: [],
  wire: null,
  bbox: null,
  hoveredFieldId: null,
};

const ViewRecordPage: React.FC = () => {
  const [state, setState] = useState<ViewRecordStateIF>(initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const wire = state.wire;
  return (
    <ViewRecordStateProvider value={{ state, setState }}>
      <PageContainer className="gap-2">
        <PageNameComponent name="View Record" showBackButton />
        <div className="relative flex flex-1 overflow-y-auto" ref={containerRef}>
          <DocumentPreviewComponent containerRef={containerRef} />
          <TabViewContainer>
            <div className="flex flex-1 flex-col">
              {state.tabIndex === 0 ? (
                <ExtractedDataComponent containerRef={containerRef} />
              ) : state.tabIndex === 1 ? (
                <DocumentBotComponent />
              ) : (
                <div>Comments</div>
              )}
            </div>
          </TabViewContainer>{' '}
          {wire && (
            <svg className="pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full">
              <line x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2} stroke="#FFA901" strokeWidth={2} strokeDasharray={4} />
              <circle cx={wire.x1} cy={wire.y1} r={4} fill="#FFA901" />
              <circle cx={wire.x2} cy={wire.y2} r={4} fill="#FFA901" />
            </svg>
          )}
        </div>
      </PageContainer>
    </ViewRecordStateProvider>
  );
};

export default ViewRecordPage;
