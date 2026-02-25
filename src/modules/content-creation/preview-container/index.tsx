import { RichTextEditor } from '../../../components/RichTextEditor';
import BackButton from '../../../components/BackButton';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';

export default function PreviewContainer() {
    const { state, setState } = useContentCreationEditorState();

    return (
        <div className="px-4">
            <div className="py-3 flex items-center gap-3">
                <BackButton />
                <p className="text-xl font-semibold">Content Preview: {state.extractedData?.name}</p>
            </div>
            <RichTextEditor height="calc(100vh - 56px)" value={state.content || ''} onChange={value => setState(prev => ({ ...prev, content: value }))} />
        </div>
    );
}
