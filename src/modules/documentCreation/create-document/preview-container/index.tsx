import { useEffect } from 'react';
import { useDocumentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import { useParams } from 'react-router-dom';
import { useDocumentCreationEditorApi } from '../hooks/useDocumentCreationEditorApi';
import { cn } from '../../../../global-utils/twMerge';
import FullScreenLoader from '../../../../components/FullScreenLoader';
import { Button } from '../../../../components/Button';

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
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center gap-2 w-full justify-between">
                <p className="text-xl pl-2 font-semibold">Document Preview</p>
                <Button onClick={handleFillFormUsingKnowledgeBase} outlined>
                    {state.applyingKnowledgeBase ? 'Applying Knowledge Base...' : 'Apply Knowledge Base'}
                </Button>
            </div>
            <div className="p-6 rounded-lg border h-full flex flex-col gap-6 overflow-y-auto">
                {state.documentText.split('\n').map((item: string, index: number) => (
                    <div className={cn('leading-12', isAllCaps(item) && 'font-bold text-lg')} key={index}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviewComponent;
