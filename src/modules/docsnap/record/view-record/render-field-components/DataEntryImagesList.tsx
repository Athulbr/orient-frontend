import { FC } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { XCircle } from 'lucide-react';

export const DataEntryImagesList: FC = () => {
    const { state, setState } = useViewRecordState();
    const toggleImage = (image: string) => {
        setState(prev => ({
            ...prev,
            selectedDataEntryImages: prev.selectedDataEntryImages.includes(image)
                ? prev.selectedDataEntryImages.filter(img => img !== image)
                : [...prev.selectedDataEntryImages, image]
        }));
    };
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between  px-3">
                <div className="flex gap-2 font-semibold">Web Images</div>
                <XCircle
                    tabIndex={-1}
                    onClick={() => setState(prev => ({ ...prev, showDataEntryImages: false }))}
                    className="cursor-pointer text-gray-500 hover:text-red-500"
                />
            </div>
            <div className="flex  gap-2 overflow-x-auto rounded-lg border bg-white p-3 hover:border-blue-400">
                {state.dataEntryWebImages
                    ?.filter(item => !item.includes('logo') && !item.includes('flag'))
                    .map((image, index) => {
                        const selected = state.selectedDataEntryImages.includes(image);
                        return (
                            <div
                                key={index}
                                className={
                                    `relative flex-none ${
                                        selected
                                            ? 'border-2 border-sky-500 p-1 rounded-md'
                                            : 'border-2 border-gray-300 p-1 rounded-md'
                                    }`
                                }
                            >
                                <input
                                    type="checkbox"
                                    className="absolute right-2 top-2 h-5 w-5 accent-blue-600 bg-white rounded shadow cursor-pointer"
                                    checked={selected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleImage(image);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <img
                                    onClick={() => toggleImage(image)}
                                    src={image}
                                    className={'block h-86 w-auto object-contain'}
                                    alt=""
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

