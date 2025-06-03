import { ReactNode } from 'react';
import { TabNavComponent } from '../../components/TabNav/TabNav';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';
import React from 'react';
import { Button } from '../../../../../components/Button';
import { useNavigate } from 'react-router-dom';

interface DataPreviewComponentIF {
  children: ReactNode;
}

export const TabViewContainer: React.FC<DataPreviewComponentIF> = ({ children }) => {
  const { state, setState } = useViewRecordState();
  const navigate = useNavigate();
  useViewRecordApi();
  return (
    <div className="flex flex-1 flex-col overflow-y-auto rounded-lg border bg-[#f9fafb]">
      <TabNavComponent className="sticky top-0 left-0 z-11 bg-[#f9fafb]" onChange={tabIndex => setState(prev => ({ ...prev, tabIndex }))} showExportButton />
      <div className="w-full border-b"></div>
      <div className="flex flex-1 flex-col">
        {state.tabIndex === 0 ? React.Children.toArray(children)[0] : state.tabIndex === 1 ? React.Children.toArray(children)[1] : <div>Comments</div>}
      </div>
      <div className="sticky bottom-0 left-0 z-11 flex items-center justify-end gap-2 border-t bg-white p-2">
        <Button onClick={() => navigate(-1)} outlined small>
          Cancel
        </Button>
        <Button outlined small>
          Update
        </Button>
        <Button outlined small>
          Submit
        </Button>
      </div>
    </div>
  );
};
