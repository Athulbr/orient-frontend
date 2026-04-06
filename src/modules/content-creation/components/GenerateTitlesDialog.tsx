import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { DialogComponent } from '../../../components/DialogComponent';

interface GenerateTitlesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: { instructions: string; tone: string; count: number }) => void;
}

export default function GenerateTitlesDialog({ isOpen, onClose, onGenerate }: GenerateTitlesDialogProps) {
    const [instructions, setInstructions] = useState('');
    const [tone, setTone] = useState('Neutral');
    const [count, setCount] = useState<number>(5);

    const tones = ['Neutral', 'Conversational', 'Authority', 'Listicle', 'How-to'];
    const counts = [3, 5, 10];

    const handleGenerate = () => {
        onGenerate({ instructions, tone, count });
        onClose();
        // optionally reset fields
        setInstructions('');
        setTone('Neutral');
        setCount(5);
    };

    return (
        <DialogComponent 
            isOpen={isOpen} 
            closeDialog={onClose}
            className="sm:max-w-lg overflow-hidden shadow-2xl rounded-xl"
        >
            <div className="flex flex-col text-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold tracking-wide text-gray-900">
                            Generate more titles with a prompt
                        </h2>
                    </div>
                    {/* The DialogComponent already renders its own header if we pass `name`, but we are doing custom so we include Close */}
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-5 p-5">
                    {/* Angle Field */}
                    {/* Instructions Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Additional instructions (optional)</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                            placeholder="e.g. Keep under 65 chars. Include 'chamber'. Avoid question format."
                        />
                    </div>

                    {/* Tones Selection */}
                    <div className="flex flex-col gap-2 pt-1">
                        <label className="text-sm font-medium text-gray-700">Tone</label>
                        <div className="flex flex-wrap gap-2">
                            {tones.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        tone === t 
                                            ? 'bg-blue-600 text-white border border-blue-500' 
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count Selection */}
                    <div className="flex flex-col gap-2 pt-1">
                        <label className="text-sm font-medium text-gray-700">How many?</label>
                        <div className="flex gap-2">
                            {counts.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCount(c)}
                                    className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        count === c 
                                            ? 'bg-blue-600 text-white border border-blue-500' 
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 pt-3 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        Generate {count} more titles
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
