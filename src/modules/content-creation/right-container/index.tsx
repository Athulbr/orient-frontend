import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Pencil } from 'lucide-react';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import EditableField from '../components/EditableField';
import SummaryImageField from '../components/SummaryImageField';
import KeywordsSection from '../components/KeywordsSection';
import EditPromptDialog from '../components/EditPromptDialog';
import type { Keyword } from '../types';

export default function RightContainer({ htmlContent, record }: { htmlContent: string; record: Record<string, any> | null }) {
    const { state, setState } = useContentCreationEditorState();
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);

    const handleFieldSave = (field: string, value: string) => {
        setState(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleKeyword = (index: number) => {
        if (!state.keywords) return;
        const updatedKeywords = [...state.keywords];
        updatedKeywords[index] = {
            ...updatedKeywords[index],
            selected: updatedKeywords[index].selected === false
        };
        setState(prev => ({ ...prev, keywords: updatedKeywords }));
    };

    const handleAddKeyword = (keyword: Keyword) => {
        setState(prev => ({ ...prev, keywords: [...(prev.keywords || []), keyword] }));
    };

    const downloadHTML = () => {
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Generated content">
    <title>Document</title>
</head>
<body>
${htmlContent}
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `content-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col overflow-y-auto h-full min-h-0 px-4 gap-2">
            <div className="p-2 sticky top-0 bg-white z-10 flex items-center justify-between border-b">
                <p className="text-xl font-semibold">Content Details</p>
                <Button outlined startIcon={<Pencil size={14} />} onClick={() => setPromptDialogOpen(true)}>
                    Edit Prompt
                </Button>
            </div>

            <EditableField label="Name" value={state.name || ''} onSave={value => handleFieldSave('name', value)} />
            <EditableField label="Author" value={state.author || ''} onSave={value => handleFieldSave('author', value)} />
            <SummaryImageField imageUrl={state.primaryImageUrl || ''} onSave={url => handleFieldSave('primaryImageUrl', url)} />

            {state.keywords && state.keywords.length > 0 && (
                <KeywordsSection keywords={state.keywords} onToggle={handleToggleKeyword} onAdd={handleAddKeyword} />
            )}

            <div className="flex gap-2 justify-end sticky bottom-0 z-10 bg-white border-t py-4 px-2 mt-auto">
                <Button disabled={!htmlContent} onClick={downloadHTML}>
                    Download HTML
                </Button>
            </div>

            <EditPromptDialog isOpen={promptDialogOpen} onClose={() => setPromptDialogOpen(false)} record={record} />
        </div>
    );
}
