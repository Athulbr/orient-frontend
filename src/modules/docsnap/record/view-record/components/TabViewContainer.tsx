import { ReactNode, useState } from 'react';
import { TabNavComponent } from '../../components/TabNav/TabNav';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordState } from '../hooks/viewRecordContext';

interface DataPreviewComponentIF {
  children: ReactNode;
}

export const TabViewContainer: React.FC<DataPreviewComponentIF> = ({ children }) => {
  const { state, setState } = useViewRecordState();
  useViewRecordApi();
  return (
    <div className="flex flex-1 flex-col overflow-y-auto rounded-lg border bg-[#f9fafb]">
      <TabNavComponent className="sticky top-0 left-0" onChange={tabIndex => setState(prev => ({ ...prev, tabIndex }))} showExportButton />
      <div className="w-full border-b"></div>
      {children}
    </div>
  );
};
