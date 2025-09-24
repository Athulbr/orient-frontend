import { FC } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';

export const DataEntryImages: FC = () => {
    const { state, setState } = useViewRecordState();

    if (state.dataEntryWebImages?.length === 0) return null;

    return (
        <>
            {state.arrayFields.map((item, mainIndex) => {
                return (
                    <div key={mainIndex} className="flex flex-col gap-2 rounded-lg border bg-white p-3 hover:border-blue-400">
                        <button
                            tabIndex={-1}
                            onClick={() => setState(prev => ({ ...prev, selectedTableName: '', showDataEntryImages: !prev.showDataEntryImages }))}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border py-3 pr-3 pl-6 font-semibold hover:border-blue-300`}
                        >
                            Web Images ({state.dataEntryWebImages?.length})
                        </button>
                    </div>
                );
            })}
        </>
    );
};
