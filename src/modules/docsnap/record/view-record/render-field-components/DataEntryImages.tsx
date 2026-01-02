import { FC } from 'react';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { TextField } from '../../../../../components/TextField';
import { Pen, SquareMousePointer, Trash2 } from 'lucide-react';

export const DataEntryImages: FC = () => {
    const { state, setState } = useViewRecordState();

    if (state.dataEntryWebImages?.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-white p-3 hover:border-blue-400">
            <div className="flex flex-col cursor-pointer gap-3   justify-between rounded-lg border py-3 pr-3 pl-6  hover:border-blue-400 ">
                <label className="font-semibold text-lg border-b pb-3">Primary Image</label>
                {state.primaryImage && (
                    <div className="flex justify-evenly items-center">
                        <img src={state.primaryImage.path} alt="" className="min-w-0 max-w-100" />
                        <Trash2
                            size={40}
                            className="cursor-pointer text-gray-200 hover:text-red-400"
                            onClick={() => setState(prev => ({ ...prev, primaryImage: null }))}
                        />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <label className="pl-1">Primary Image Caption</label>
                    <input
                        onChange={e => setState(prev => ({ ...prev, primaryImage: { path: prev.primaryImage?.path || '', caption: e.target.value } }))}
                        type="text"
                        className="border py-2.5 hover:border-[#2563eb] pr-3 pl-6 rounded-lg focus:outline-none"
                    />
                </div>
                <button
                    tabIndex={-1}
                    onClick={() => setState(prev => ({ ...prev, showSelectPrimaryImageDialog: true }))}
                    className={`flex w-full gap-2 cursor-pointer items-center  rounded-lg border py-3 pr-3 pl-6 hover:bg-blue-50  hover:border-blue-300`}
                >
                    <SquareMousePointer size={16} />
                    Select Primary Image
                </button>
            </div>
            <div className="flex flex-col cursor-pointer gap-4  justify-between rounded-lg border py-3 pr-3 pl-6 hover:border-blue-400 ">
                <label className="font-semibold text-lg border-b pb-3 ">Additional Images</label>
                {state.additionalImages?.map((image: any, index: number) => (
                    <div className="flex flex-col gap-2 border p-4 rounded-lg hover:border-gray-400" key={index}>
                        <div className="flex justify-evenly items-center">
                            <img src={image.path} alt="" className="w-[60%] min-w-0 max-w-50" />
                            <Trash2
                                size={40}
                                className="cursor-pointer text-gray-200 hover:text-red-400"
                                onClick={() =>
                                    setState(prev => ({ ...prev, additionalImages: prev.additionalImages.filter((item: any, idx: number) => idx !== index) }))
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1 pt-2">
                            <label className="pl-1">Image Caption</label>
                            <input
                                onChange={e =>
                                    setState(prev => ({
                                        ...prev,
                                        additionalImages: prev.additionalImages.map((item: any, idx: number) =>
                                            idx === index ? { ...item, caption: e.target.value } : item
                                        )
                                    }))
                                }
                                type="text"
                                className="border py-2.5 hover:border-[#2563eb] pr-3 pl-6 rounded-lg focus:outline-none"
                            />
                        </div>
                    </div>
                ))}

                <button
                    tabIndex={-1}
                    onClick={() => setState(prev => ({ ...prev, showSelectAdditionalImagesDialog: true }))}
                    className={`flex w-full gap-2 cursor-pointer items-center  rounded-lg border py-3 pr-3 pl-6  hover:bg-blue-50  hover:border-blue-300`}
                >
                    <SquareMousePointer size={16} />
                    Add Additional Images
                </button>
            </div>
        </div>
    );
};
