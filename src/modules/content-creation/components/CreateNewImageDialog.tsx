import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, Maximize, RefreshCcw, Check } from 'lucide-react';
import { DialogComponent } from '../../../components/DialogComponent';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import { useToastStore } from '../../../components/toast/ToastStore';

export default function CreateNewImageDialog({ isOpen, onClose, onImagesGenerated }: { isOpen: boolean; onClose: () => void; onImagesGenerated?: (urls: string[]) => void }) {
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('Photorealistic');
    const [aspectRatio, setAspectRatio] = useState('16:9 (Landscape)');
    const [count, setCount] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
    const toast = useToastStore();

    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setStyle('Photorealistic');
            setAspectRatio('16:9 (Landscape)');
            setCount(3);
            setGeneratedUrls([]);
            setIsGenerating(false);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsGenerating(true);
        setGeneratedUrls([]);
        try {
            const res: any = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/create-new-images`, {
                description,
                style,
                aspectRatio,
                count
            });
            if (res?.data?.imageUrls && Array.isArray(res.data.imageUrls)) {
                setGeneratedUrls(res.data.imageUrls);
                toast.success(`Successfully generated ${res.data.imageUrls.length} image(s)!`);
                if (onImagesGenerated) {
                    onImagesGenerated(res.data.imageUrls);
                }
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to generate new images.');
        } finally {
            setIsGenerating(false);
        }
    };

    const suggestChips = [
        'Cryotherapy chamber exterior', 'Athlete in cryo session', 'Temperature comparison chart',
        'Clinical safety diagram', 'Before/after wellness photo'
    ];
    
    const styleChips = [
        'Photorealistic', 'Infographic', 'Illustration', 'Diagram', 'Minimalist', 'Dark mode'
    ];
    
    const aspectChips = [
        '16:9 (Landscape)', '1:1 (Square)', '4:3', 'Portrait 9:16'
    ];
    
    const countChips = [1, 2, 3, 4];

    return (
        <DialogComponent 
            isOpen={isOpen} 
            closeDialog={onClose}
            className="sm:max-w-6xl w-[90vw] overflow-hidden shadow-2xl rounded-xl"
        >
            <div className="flex flex-col text-gray-900 h-[85vh] max-h-[800px]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold tracking-wide text-gray-900">
                            Create New Image
                        </h2>
                        <p className="text-sm text-gray-500">Describe an image and it will be generated and added to your image library.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 border rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 min-h-0 overflow-hidden bg-white">
                    {/* Left Form Panel */}
                    <div className="flex pl-6 pr-8 py-6 flex-col gap-6 w-3/5 overflow-y-auto">
                        
                        {/* Desc */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-gray-800">Image description *</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-white text-gray-800 border-2 border-blue-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-0 min-h-[100px] resize-none"
                                placeholder="e.g. A person stepping into a sleek electric whole-body cryotherapy chamber in a modern sports medicine clinic, blue ambient lighting..."
                            />
                            
                            <div className="flex flex-col gap-1.5 mt-2">
                                <span className="text-xs text-gray-500 font-medium">Quick suggestions:</span>
                                <div className="flex flex-wrap gap-2">
                                    {suggestChips.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => setDescription(s)}
                                            className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Style */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-gray-800">Image style</label>
                            <div className="flex flex-wrap gap-2">
                                {styleChips.map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors border ${style === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-[15px] font-semibold text-gray-800">Aspect ratio</label>
                            <div className="flex flex-wrap gap-2">
                                {aspectChips.map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setAspectRatio(s)}
                                        className={`px-5 py-2 text-sm font-medium transition-colors border w-36 ${aspectRatio === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {/* <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20">
                                <Maximize size={32} />
                            </div> */}
                        </div>

                        {/* Quantity */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-gray-800">Generate how many?</label>
                            <div className="flex flex-wrap gap-2">
                                {countChips.map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setCount(c)}
                                        className={`w-12 h-10 flex items-center justify-center text-sm font-semibold transition-colors border ${count === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Preview Panel */}
                    <div className="flex flex-col w-2/5 border-l bg-gray-50 p-6 overflow-y-auto">
                        <div className="flex items-center justify-center mb-4">
                            <span className="text-sm font-medium text-gray-400">Preview</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {isGenerating ? (
                                Array.from({ length: count }).map((_, i) => (
                                    <div key={`gen-${i}`} className="aspect-video bg-blue-50 border-2 border-blue-200 border-dashed rounded-sm flex flex-col gap-2 items-center justify-center text-blue-500 shadow-inner">
                                        <RefreshCcw size={28} className="animate-spin" />
                                        <span className="text-sm font-medium">Generating...</span>
                                    </div>
                                ))
                            ) : generatedUrls.length > 0 ? (
                                generatedUrls.map((url, i) => (
                                    <div key={`img-${i}`} className="aspect-video bg-gray-100 flex items-center justify-center rounded-sm overflow-hidden shadow-sm border border-gray-200">
                                        <img src={url} alt={`Generated ${i+1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: count }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-video bg-[#e6dcf3] border border-[#d1c4e9] rounded-sm flex items-center justify-center shadow-inner relative">
                                        <ImageIcon size={32} className="text-[#a890d3]" />
                                        {i === count - 1 && <span className="absolute bottom-4 text-xs text-gray-400">Generated images will appear here</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 px-6 border-t border-gray-200 shrink-0">
                    {/* <p className="text-sm text-gray-500">
                        Generated images are saved to your Image Library and can be dragged into the article.
                    </p> */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={generatedUrls.length > 0 ? onClose : handleGenerate}
                            disabled={!description.trim() || isGenerating}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-colors shadow-sm ${
                                !description.trim() || isGenerating
                                    ? 'bg-blue-300 text-white cursor-not-allowed border outline-none' 
                                    : generatedUrls.length > 0 
                                        ? 'bg-green-600 hover:bg-green-700 text-white border border-green-700'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700'
                            }`}
                        >
                            {isGenerating ? (
                                <RefreshCcw size={16} className="text-white animate-spin" />
                            ) : generatedUrls.length > 0 ? (
                                <Check size={16} className="text-white" />
                            ) : (
                                <Sparkles size={16} className="text-blue-200" />
                            )}
                            {isGenerating ? 'Generating...' : generatedUrls.length > 0 ? 'Done Adding' : 'Generate Images'}
                        </button>
                    </div>
                </div>
            </div>
        </DialogComponent>
    );
}
