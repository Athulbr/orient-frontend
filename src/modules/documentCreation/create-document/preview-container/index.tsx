import { useEffect } from 'react';
import { useDocumentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import { useParams } from 'react-router-dom';
import { useDocumentCreationEditorApi } from '../hooks/useDocumentCreationEditorApi';
import { cn } from '../../../../global-utils/twMerge';
import FullScreenLoader from '../../../../components/FullScreenLoader';

interface PreviewComponentIF {
    test?: string;
}

const PreviewComponent: React.FC<PreviewComponentIF> = () => {
    const { state, setState } = useDocumentCreationEditorState();
    const { id } = useParams();
    const { getTemplateByIdApi } = useDocumentCreationEditorApi();

    const isAllCaps = (text: string): boolean => {
        return /^[A-Z0-9]+$/.test(text.replace(/\s/g, ''));
    };

    useEffect(() => {
        if (!id) return;
        getTemplateByIdApi(id);
    }, [id]);

    if (state.loadingTemplate) return <FullScreenLoader />;

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
            <p className="text-xl pl-2 font-semibold">Document Preview</p>
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
