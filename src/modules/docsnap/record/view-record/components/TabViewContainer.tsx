import { ReactNode, useEffect } from 'react';
import { TabNavComponent } from '../../components/TabNav/TabNav';
import { useViewRecordState } from '../hooks/viewRecordContext';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordGlobalStore } from '../hooks/useViewRecordGlobalStore';

interface DataPreviewComponentIF {
  children: ReactNode;
}

export const TabViewContainer: React.FC<DataPreviewComponentIF> = ({ children }) => {
  const { state, setState } = useViewRecordState();

  const { id } = useParams();
  const { getRecordApiById } = useViewRecordApi();
  const { refresh } = useViewRecordGlobalStore();
  useEffect(() => {
    if (!id) return;
    getRecordApiById(id);
  }, [id, refresh]);

  return (
    <div className={`flex h-[100vh] flex-col border-l bg-[#f9fafb] ${state.tabIndex === 0 ? 'max-w-100' : 'max-w-150'}`}>
      <TabNavComponent className="border-b bg-[#f9fafb]" onChange={tabIndex => setState(prev => ({ ...prev, tabIndex }))} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {state.tabIndex === 0 ? React.Children.toArray(children)[0] : state.tabIndex === 1 ? React.Children.toArray(children)[1] : <div>Comments</div>}
      </div>
    </div>
  );
};
