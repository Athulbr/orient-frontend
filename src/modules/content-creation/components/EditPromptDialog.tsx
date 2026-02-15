import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../../components/Button';
import Spinner from '../../../components/Spinner';
import { DialogComponent } from '../../../components/DialogComponent';
import { useToastStore } from '../../../components/toast/ToastStore';
import { usePromptApi } from '../../docsnap/template/update-template/hooks/usePromptApi';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';

interface EditPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record: Record<string, any> | null;
}

export default function EditPromptDialog({ isOpen, onClose, record }: EditPromptDialogProps) {
    const toast = useToastStore();
    const { generatePromptWithAI } = usePromptApi();

    const [promptText, setPromptText] = useState('');
    const [loadingPrompt, setLoadingPrompt] = useState(false);
    const [copied, setCopied] = useState(false);
    const [aiInstruction, setAiInstruction] = useState('');
    const [generatingPrompt, setGeneratingPrompt] = useState(false);

    const handleOpen = async () => {
        const templateId = record?.templateId?._id;
        if (!templateId) {
            toast.error('No template associated with this record');
            onClose();
            return;
        }
        setLoadingPrompt(true);
        try {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${templateId}`);
            setPromptText(res.data?.settings?.extractionPrompt || '');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch prompt');
            onClose();
        } finally {
            setLoadingPrompt(false);
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGeneratePrompt = async () => {
        if (!aiInstruction.trim()) {
            toast.error('Please describe what you want the prompt to do');
            return;
        }
        setGeneratingPrompt(true);
        const result = await generatePromptWithAI({
            userInstruction: aiInstruction,
            currentPrompt: promptText,
            fields: []
        });
        if (result) {
            setPromptText(result);
        }
        setGeneratingPrompt(false);
    };

    // Fetch prompt when dialog opens
    if (isOpen && !promptText && !loadingPrompt) {
        handleOpen();
    }

    return (
        <DialogComponent
            name="Edit Prompt"
            className="h-[90%] w-[90%]"
            isOpen={isOpen}
            closeDialog={onClose}
            disableBlurCloseDialog
            secondaryButtonText={copied ? '✓ Copied!' : 'Copy Prompt to Clipboard'}
            primaryButtonText="Close"
            onSecondaryAction={handleCopyPrompt}
            onPrimaryAction={onClose}
        >
            <div className="flex h-full flex-1 gap-0 overflow-hidden p-4">
                <div className="flex flex-1 flex-col">
                    {loadingPrompt ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner size={24} />
                        </div>
                    ) : (
                        <textarea
                            value={promptText}
                            onChange={e => setPromptText(e.target.value)}
                            className="flex-1 resize-none p-5 font-mono text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400"
                            placeholder="Write your extraction prompt here..."
                            spellCheck={false}
                        />
                    )}
                </div>

                <div className="flex w-[30%] flex-col border-l bg-gray-50/50">
                    <div className="flex items-center gap-2 border-b px-5 py-3">
                        <Sparkles size={15} className="text-amber-500" />
                        <span className="text-sm font-medium text-gray-800">AI Assistant</span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between overflow-y-auto p-5">
                        <div className="flex flex-col gap-4">
                            <p className="text-xs leading-relaxed text-gray-500">
                                Describe what you need and the AI will generate or update your prompt. If a prompt already exists, it will be refined based
                                on your instructions.
                            </p>
                            <textarea
                                value={aiInstruction}
                                onChange={e => setAiInstruction(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey && aiInstruction.trim() && !generatingPrompt) {
                                        e.preventDefault();
                                        handleGeneratePrompt();
                                    }
                                }}
                                className="min-h-[160px] resize-none rounded-lg border border-gray-200 bg-white p-3.5 text-sm leading-relaxed text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                placeholder="e.g., Generate a prompt that extracts content with SEO optimization..."
                                disabled={generatingPrompt}
                            />
                            <Button
                                startIcon={generatingPrompt ? <Spinner size={16} /> : <Sparkles size={16} />}
                                onClick={handleGeneratePrompt}
                                disabled={generatingPrompt || !aiInstruction.trim()}
                                className="w-full"
                            >
                                {generatingPrompt ? 'Generating...' : promptText.trim() ? 'Update Prompt with AI' : 'Generate Prompt'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DialogComponent>
    );
}
