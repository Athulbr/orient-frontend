import { useEffect } from 'react';
import { useDocumentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import { useParams } from 'react-router-dom';
import { useDocumentCreationEditorApi } from '../hooks/useDocumentCreationEditorApi';
import { cn } from '../../../../global-utils/twMerge';
import FullScreenLoader from '../../../../components/FullScreenLoader';
import { Button } from '../../../../components/Button';
import { HighlightedText } from './HighlightedText';
import Spinner from '../../../../components/Spinner';
import { Pen } from 'lucide-react';

interface PreviewComponentIF {
    test?: string;
}

const PreviewComponent: React.FC<PreviewComponentIF> = () => {
    const { state, setState } = useDocumentCreationEditorState();
    const { id } = useParams();
    const { getTemplateByIdApi, fillFormFieldsWithAI } = useDocumentCreationEditorApi();

    const isAllCaps = (text: string): boolean => {
        return /^[A-Z0-9]+$/.test(text.replace(/\s/g, ''));
    };

    useEffect(() => {
        if (!id) return;
        getTemplateByIdApi(id);
    }, [id]);

    if (state.loadingTemplate) return <FullScreenLoader />;

    const handleFillFormUsingKnowledgeBase = () => {
        setState(prev => ({ ...prev, applyingKnowledgeBase: true }));
        fillFormFieldsWithAI();
    };
    return (
        <div className="p-6 pt-0 h-full flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center gap-2 w-full justify-between z-50 bg-white pt-4">
                <p className="text-xl pl-2 font-semibold">Document Preview</p>
                <div className="flex items-center gap-2">
                    <Button startIcon={state.applyingKnowledgeBase ? <Spinner size={18} /> : null} onClick={handleFillFormUsingKnowledgeBase} outlined>
                        {state.applyingKnowledgeBase ? 'Applying Knowledge Base...' : 'Apply Knowledge Base'}
                    </Button>
                    <Button outlined startIcon={<Pen size={16} />}>
                        Edit Text
                    </Button>
                </div>
            </div>
            <div className="p-6 rounded-lg border h-full flex flex-col gap-6 overflow-y-auto">
                {state.documentText?.split('\n').map((item: string, index: number) => (
                    <div className={cn('leading-12', index % 2 === 0 ? 'bg-green-5000' : 'bg-red-5000')} key={index}>
                        <HighlightedText template={item} data={state.formValues} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviewComponent;
