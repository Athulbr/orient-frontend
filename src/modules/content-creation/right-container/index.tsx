import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Pencil } from 'lucide-react';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import EditableField from '../components/EditableField';
import SummaryImageField from '../components/SummaryImageField';
import KeywordsSection from '../components/KeywordsSection';
import EditPromptDialog from '../components/EditPromptDialog';
import { useContentCreationApi } from '../hooks/useContentCreationApi';
import type { Keyword } from '../types';
import Spinner from '../../../components/Spinner';
import httpRequest from '../../../global-utils/httpRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { useToastStore } from '../../../components/toast/ToastStore';
import { config } from '../../../config/default';

export default function RightContainer() {
    const { state, setState } = useContentCreationEditorState();
    const { regenerateBlog, updateRecordApi } = useContentCreationApi();
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const toast = useToastStore();
    const { id } = useParams();
    const navigate = useNavigate();

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

    const handleSelectAll = (selected: boolean) => {
        if (!state.keywords) return;
        const updatedKeywords = state.keywords.map(k => ({ ...k, selected }));
        setState(prev => ({ ...prev, keywords: updatedKeywords }));
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
${state.content}
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

    const handleOnSave=()=>{
        const payload={
            extractedData:{
                name:state.name,
                author:state.author,
                rowData:state.rowData,
                primaryImageUrl:state.primaryImageUrl,
                keywords:state.keywords,
                content:state.content,
                record:state.record
            }
        }
        updateRecordApi(payload)
    
    }

    const handleOnSubmit = async () => {
        const fullHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Generated content">
            <title>Document</title>
        </head>
        <body>
        ${state.content}
        </body>
        </html>`;

        const selectedTenantName = window?.sessionStorage?.getItem('selectedTenantName') || '';
        const selectedModule = window?.sessionStorage?.getItem('module') || '';

        const content = {
            title: state.name,
            category: '',
            summaryHTML: '',
            summaryImagePath: state.primaryImageUrl,
            product_category: '',
            html: fullHTML,
            author: state.author || ''
        };
        const payload = {
            tenant_name: selectedTenantName,
            module: selectedModule,
            blog: content,
            recordId: id
        };
        try {
            setState(prev => ({ ...prev, loadingData: true }));
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/rehab/create`, payload);
            toast.success('Record submitted successfully');
            if (selectedModule === 'content-creation') navigate('/content-creation/record/list');
        } catch (error: any) {
            console.error('Error submitting content:', error);
            toast.error(error?.message || 'Failed to submit blog content');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const reGenerateContent = async () => {
        if (!state.content) return;
        setIsRegenerating(true);
        try {
            const res = await regenerateBlog({
                keywords: state.keywords,
                rowData: state.rowData,
                extractionPrompt: state.extractionPrompt
            });
            if (res.data?.htmlContent) {
                setState(prev => ({ ...prev, content: res.data.htmlContent }));
                console.log('Regenerated content:', res.data.htmlContent);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0 gap-2 overflow-y-auto px-4">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-2">
                <p className="text-xl font-semibold">Content Details</p>
                <Button outlined startIcon={<Pencil size={14} />} onClick={() => setPromptDialogOpen(true)}>
                    Edit Prompt
                </Button>
            </div>

            <EditableField label="Name" value={state.name || ''} onSave={value => handleFieldSave('name', value)} />
            <EditableField label="Author" value={state.author || ''} onSave={value => handleFieldSave('author', value)} />
            <SummaryImageField imageUrl={state.primaryImageUrl || ''} onSave={url => handleFieldSave('primaryImageUrl', url)} />

            {state.keywords && state.keywords.length > 0 && (
                <KeywordsSection keywords={state.keywords} onToggle={handleToggleKeyword} onAdd={handleAddKeyword} onSelectAll={handleSelectAll} />
            )}

            <div className="sticky bottom-0 z-10 mt-auto flex justify-end gap-2 border-t bg-white px-2 py-4">
                <Button disabled={!state.content || isRegenerating} onClick={reGenerateContent} startIcon={isRegenerating ? <Spinner size={16} /> : null}>
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
                <Button disabled={!state.content} onClick={downloadHTML}>
                    Download HTML
                </Button>
                <Button disabled={!state.content} onClick={handleOnSave}>
                    Save
                </Button>
                <Button disabled={!state.content} onClick={handleOnSubmit}>
                    Submit
                </Button>
            </div>

            <EditPromptDialog isOpen={promptDialogOpen} onClose={() => setPromptDialogOpen(false)} record={state.record || null} />
        </div>
    );
}
