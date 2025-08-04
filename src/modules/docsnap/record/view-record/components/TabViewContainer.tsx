import { ReactNode, useEffect } from 'react';
import { TabNavComponent } from '../../components/TabNav/TabNav';
import { useViewRecordState } from '../hooks/viewRecordContext';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useViewRecordApi } from '../hooks/useViewRecordApi';
import { useViewRecordGlobalStore } from '../../../../../zustand-store/useViewRecordGlobalStore';

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
    const tabs = [
        { id: 'data', title: 'Extracted Data' },
        { id: 'chat', title: 'Chat with Document' }
        // { id: 'invoice', title: 'Invoice Generator' },
    ];

    return (
        <div className={`flex h-full w-full flex-col border-l bg-gray-50`}>
            <TabNavComponent tabs={tabs} className="relative z-20 border-b" onChange={tabIndex => setState(prev => ({ ...prev, tabIndex }))} />
            <div className="flex flex-1 flex-col overflow-hidden">
                {state.tabIndex === 0 ? (
                    React.Children.toArray(children)[0]
                ) : state.tabIndex === 1 ? (
                    React.Children.toArray(children)[1]
                ) : state.tabIndex === 2 ? (
                    React.Children.toArray(children)[2]
                ) : (
                    <div>Comments</div>
                )}
            </div>
        </div>
    );
};
