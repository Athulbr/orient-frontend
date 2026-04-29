import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, Download, Copy, Trash2, Maximize2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import CreateNewImageDialog from './CreateNewImageDialog';
import RegenerateImageDialog from './RegenerateImageDialog';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import { useToastStore } from '../../../components/toast/ToastStore';

export default function ImagesTab() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [regenModalOpen, setRegenModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const { state, setState } = useContentCreationEditorState();
    const toast = useToastStore();
    const [images, setImages] = useState<{ id: string, title: string, src: string }[]>([]);

    const handleDeleteImage = (imgObj: any) => {
        // 1. Remove from sidebar state
        setImages(prev => prev.filter(i => i.id !== imgObj.id));

        // 2. Remove from global store safely
        if (state.extractedData?.rowData?.imageList) {
            state.extractedData.rowData.imageList = state.extractedData.rowData.imageList.filter((i: any) => {
                const targetSrc = i.url || i.src;
                return targetSrc !== imgObj.src;
            });
        }

        // 3. Revert to dummy image in the Editor Content
        if (state.content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(state.content, 'text/html');
            const imgTags = Array.from(doc.querySelectorAll('img'));
            let replaced = false;

            for (const domImg of imgTags) {
                const currentSrc = domImg.getAttribute('src') || domImg.src;
                if (currentSrc === imgObj.src) {
                    domImg.setAttribute('src', 'https://placehold.co/600x400/f0f2f5/8b949e?text=Product+Image');
                    replaced = true;
                }
            }

            if (replaced) {
                setState(prev => ({ ...prev, content: doc.body.innerHTML }));
                toast.success('Image removed from gallery & reverted to dummy in text!');
            } else {
                toast.success('Image removed from gallery explicitly.');
            }
        }
    };

    useEffect(() => {
        // Read directly from the separate imageList extracted during LLM generation.
        // This decouples the right-hand gallery from the DOM, so deleting placeholders in the editor won't vanish the gallery!
        const imageList = state.extractedData?.rowData?.imageList;

        if (imageList && Array.isArray(imageList) && imageList.length > 0) {
            const mappedImages = imageList.map((img: any, idx: number) => ({
                id: `row-img-${idx}`,
                title: img.title || `Product Image ${idx + 1}`,
                src: img.url || ''
            })).filter(img => img.src);
            
            // Because we decoupled from state.content, images persist safely!
            setImages(mappedImages);
        } else if (state.content && images.length === 0) {
            // Fallback for older documents that didn't generate an imageList separately
            const parser = new DOMParser();
            const doc = parser.parseFromString(state.content, 'text/html');
            const imgTags = Array.from(doc.querySelectorAll('img'));
            
            const extractedImages = imgTags.map((img, idx) => ({
                id: `img-${idx}`,
                title: img.getAttribute('alt') || `Generated Image ${idx + 1}`,
                src: img.getAttribute('src') || img.src || '' 
            })).filter(img => img.src && !img.src.includes('placehold.co'));
            
            setImages(extractedImages);
        }
    }, [state.extractedData?.rowData?.imageList]);

    return (
        <div className="flex flex-col h-full min-h-0 w-full bg-white">
            <div className="p-4 border-b flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-gray-900">Content Images</h3>
                    <p className="text-sm text-gray-500">
                        AI-generated images based on your article topic. Drag & drop or copy & paste into the editor.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors bg-white">
                        <RefreshCcw size={16} />
                        Regenerate All
                    </button>
                    <button 
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors border border-blue-600 shadow-sm"
                    >
                        <Sparkles size={16} />
                        Create New Image
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/30">
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {images.map(img => (
                            <div key={img.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col group hover:border-gray-300">
                                <div className="relative aspect-video bg-gray-100 flex items-center justify-center p-2 cursor-grab active:cursor-grabbing border-b border-gray-100 overflow-hidden" draggable>
                                    <img src={img.src} alt={img.title} className="w-full h-full object-cover rounded-sm shadow-sm" />
                                </div>
                                <div className="p-3 flex flex-col gap-2.5">
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1" title={img.title}>{img.title}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* <button className="flex items-center gap-1 px-2.5 py-1.5 border border-blue-200 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors bg-white">
                                            <Download size={13} /> Drag
                                        </button> */}
                                        {/* <button className="flex items-center gap-1 px-2.5 py-1.5 border border-blue-200 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors bg-white">
                                            <Copy size={13} /> Copy
                                        </button> */}
                                        <button 
                                            onClick={() => {
                                                setSelectedImage(img);
                                                setRegenModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white"
                                        >
                                            <RefreshCcw size={13} /> Regen
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteImage(img)}
                                            className="flex items-center justify-center p-1.5 border border-red-200 rounded text-red-500 hover:bg-red-50 transition-colors bg-white ml-auto"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2 min-h-[200px]">
                        <p className="text-sm">No images found in the generated content.</p>
                    </div>
                )}
            </div>

            <CreateNewImageDialog isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
            <RegenerateImageDialog 
                isOpen={regenModalOpen} 
                onClose={() => setRegenModalOpen(false)} 
                image={selectedImage} 
                onRegenerate={(url?: string) => {
                    if (url && selectedImage && state.content) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(state.content, 'text/html');
                        const imgTags = Array.from(doc.querySelectorAll('img'));
                        let replaced = false;
                        
                        for (const img of imgTags) {
                            const currentSrc = img.getAttribute('src') || img.src;
                            if (currentSrc === selectedImage.src) {
                                img.setAttribute('src', url);
                                replaced = true;
                                break;
                            }
                        }
                        
                        if (replaced) {
                            // Propagate changes down into the image list specifically as well!
                            setImages(prev => prev.map(i => i.src === selectedImage.src ? { ...i, src: url } : i));
                            
                            if (state.extractedData?.rowData?.imageList) {
                                state.extractedData.rowData.imageList = state.extractedData.rowData.imageList.map((i: any) => 
                                    (i.url === selectedImage.src || i.src === selectedImage.src) ? { ...i, url: url } : i
                                );
                            }

                            setState(prev => ({ ...prev, content: doc.body.innerHTML }));
                            toast.success('Image replaced successfully in editor and gallery.');
                        } else {
                            toast.error('Could not find image to replace in content.');
                        }
                    }
                    setRegenModalOpen(false);
                }} 
            />
        </div>
    );
}
