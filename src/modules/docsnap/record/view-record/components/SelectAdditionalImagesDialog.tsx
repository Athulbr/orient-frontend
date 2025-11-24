import { DialogComponent } from '../../../../../components/DialogComponent';
import { FC } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { XCircle } from 'lucide-react';

export const SelectAdditionalImagesDialog: FC<any> = () => {
    const { state, setState } = useViewRecordState();

    const onImageClickHandler = (image: string) => {
        const isImageAlreadySelected = state.additionalImages.some(item => item.path === image);
        if (isImageAlreadySelected) {
            setState(prev => ({ ...prev, additionalImages: prev.additionalImages.filter(item => item.path !== image) }));
        } else {
            setState(prev => ({ ...prev, additionalImages: [...prev.additionalImages, { path: image, caption: '' }] }));
        }
    };

    return (
        <DialogComponent
            className="w-[95%] h-[95%] p-1"
            isOpen={true}
            closeDialog={() => setState(prev => ({ ...prev, showSelectAdditionalImagesDialog: false }))}
        >
            <div className="flex w-full flex-col overflow-y-auto flex-1">
                <div className="flex items-center justify-between  p-3">
                    <div className="flex gap-2 font-semibold text-2xl">Select Additional Images</div>
                    <XCircle
                        tabIndex={-1}
                        onClick={() => setState(prev => ({ ...prev, showSelectAdditionalImagesDialog: false }))}
                        className="cursor-pointer text-gray-500 hover:text-red-500"
                    />
                </div>
                <div className="flex flex-1 flex-wrap overflow-y-auto  gap-2  rounded-lg border bg-white p-3 ">
                    {state.dataEntryWebImages
                        ?.filter(item => !item.includes('logo') && !item.includes('flag') && !item.includes('Logo') && !item.includes('width=150'))
                        .map((image, index) => {
                            const selected = state.additionalImages.some(item => item.path === image);
                            return (
                                <div
                                    key={index}
                                    className={`group relative flex-none ${
                                        selected ? 'border-2 border-sky-500 p-1 rounded-md' : 'border-2 border-gray-300 p-1 rounded-md'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="absolute right-2 top-2 h-4 w-4 accent-blue-600 bg-white rounded shadow cursor-pointer block"
                                        checked={selected}
                                        onChange={e => {
                                            e.stopPropagation();
                                            onImageClickHandler(image);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />

                                    <img
                                        onClick={() => onImageClickHandler(image)}
                                        src={image}
                                        className={'block h-110 w-auto object-contain cursor-pointer'}
                                        alt=""
                                    />
                                </div>
                            );
                        })}
                </div>
            </div>
        </DialogComponent>
    );
};
